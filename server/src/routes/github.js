const express = require('express');
const router = express.Router();
const Integration = require('../models/Integration');
const axios = require('axios');
const auth = require('../middleware/auth');

// Conectar GitHub
router.post('/connect', auth, async (req, res) => {
  try {
    const { accessToken } = req.body;

    // Verificar las credenciales con GitHub
    const testResponse = await axios.get('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (testResponse.status !== 200) {
      throw new Error('Invalid GitHub credentials');
    }

    // Guardar o actualizar la integración
    const integration = await Integration.findOneAndUpdate(
      { userId: req.user.id, service: 'github' },
      {
        credentials: { accessToken },
        isConnected: true,
        lastSync: new Date()
      },
      { upsert: true, new: true }
    );

    res.json({
      message: 'GitHub connected successfully',
      integration: {
        id: integration._id,
        isConnected: integration.isConnected,
        lastSync: integration.lastSync
      }
    });
  } catch (error) {
    console.error('GitHub connection error:', error);
    res.status(400).json({
      error: 'Failed to connect to GitHub',
      details: error.message
    });
  }
});

// Obtener repositorios de GitHub
router.get('/repositories', auth, async (req, res) => {
  try {
    const integration = await Integration.findOne({
      userId: req.user.id,
      service: 'github',
      isConnected: true
    });

    if (!integration) {
      return res.status(404).json({
        error: 'GitHub integration not found',
        message: 'Please connect your GitHub account'
      });
    }

    const { accessToken } = integration.credentials;

    try {
      const response = await axios.get('https://api.github.com/user/repos', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json'
        },
        params: {
          sort: 'updated',
          per_page: 100
        }
      });

      const repositories = response.data;
      res.json(repositories);
    } catch (apiError) {
      // Manejar específicamente errores de token
      if (apiError.response?.status === 401) {
        // Desactivar la integración
        await Integration.findByIdAndUpdate(integration._id, {
          isConnected: false
        });

        return res.status(401).json({
          error: 'Token expired or revoked',
          message: 'GitHub token has expired or been revoked. Please reconnect your account.',
          code: 'TOKEN_REVOKED'
        });
      }

      throw apiError;
    }
  } catch (error) {
    console.error('Error fetching GitHub repositories:', error);
    res.status(500).json({
      error: 'Failed to fetch repositories',
      message: error.response?.data?.message || error.message
    });
  }
});

router.get('/tasks', auth, async (req, res) => {
  try {
    const integration = await Integration.findOne({
      userId: req.user.userId,
      service: 'github',
      isConnected: true
    });

    if (!integration) {
      return res.status(404).json({
        error: 'Integration not found',
        message: 'Please connect your GitHub account first'
      });
    }

    const { accessToken } = integration.credentials;

    // Obtener issues usando la API de búsqueda
    const issuesResponse = await axios.get(
      'https://api.github.com/search/issues', 
      {
        headers: {
          'Authorization': `token ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json'
        },
        params: {
          q: 'is:issue assignee:@me', // Busca issues asignados al usuario autenticado
          per_page: 100
        }
      }
    );

    // Obtener pull requests
    const prsResponse = await axios.get(
      'https://api.github.com/search/issues', 
      {
        headers: {
          'Authorization': `token ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json'
        },
        params: {
          q: 'is:pr assignee:@me', // Busca PRs asignados al usuario autenticado
          per_page: 100
        }
      }
    );

    // Transformar los issues
    const issues = issuesResponse.data.items.map(issue => ({
      id: `gh-issue-${issue.id}`,
      title: issue.title,
      description: issue.body,
      status: issue.state,
      priority: getPriorityFromLabels(issue.labels),
      project: issue.repository_url.split('/').slice(-2).join('/'),
      url: issue.html_url,
      source: 'github',
      type: 'issue',
      created_at: issue.created_at,
      updated_at: issue.updated_at,
      labels: issue.labels.map(label => ({
        name: label.name,
        color: label.color
      }))
    }));

    // Transformar los pull requests
    const pullRequests = prsResponse.data.items.map(pr => ({
      id: `gh-pr-${pr.id}`,
      title: pr.title,
      description: pr.body,
      status: pr.state,
      priority: getPriorityFromLabels(pr.labels),
      project: pr.repository_url.split('/').slice(-2).join('/'),
      url: pr.html_url,
      source: 'github',
      type: 'pull-request',
      created_at: pr.created_at,
      updated_at: pr.updated_at,
      labels: pr.labels.map(label => ({
        name: label.name,
        color: label.color
      }))
    }));

    // Combinar y enviar todas las tareas
    const allTasks = [...issues, ...pullRequests];
    
    // Log para debugging
    console.log(`Found ${issues.length} issues and ${pullRequests.length} pull requests`);

    res.json(allTasks);

  } catch (error) {
    console.error('Error fetching GitHub tasks:', error.response?.data || error);
    res.status(500).json({
      error: 'Failed to fetch tasks',
      message: error.message,
      details: error.response?.data
    });
  }
});

// Función auxiliar para determinar la prioridad basada en las etiquetas
function getPriorityFromLabels(labels = []) {
  const labelNames = labels.map(label => label.name.toLowerCase());
  
  if (labelNames.some(name => 
    name.includes('high') || 
    name.includes('urgent') || 
    name.includes('priority:high') ||
    name.includes('priority/high') ||
    name.includes('p1') ||
    name.includes('critical')
  )) {
    return 'high';
  }
  
  if (labelNames.some(name => 
    name.includes('low') || 
    name.includes('minor') || 
    name.includes('priority:low') ||
    name.includes('priority/low') ||
    name.includes('p3')
  )) {
    return 'low';
  }
  
  if (labelNames.some(name =>
    name.includes('medium') ||
    name.includes('priority:medium') ||
    name.includes('priority/medium') ||
    name.includes('p2')
  )) {
    return 'medium';
  }
  
  return 'medium'; // Prioridad por defecto si no hay etiquetas de prioridad
}

router.get('/calendar-events', auth, async (req, res) => {
  try {
    console.log('Fetching GitHub calendar events for user:', req.user.userId);

    const integration = await Integration.findOne({
      userId: req.user.userId,
      service: 'github',
      isConnected: true
    });

    console.log('Found GitHub integration:', integration ? 'yes' : 'no');

    if (!integration) {
      return res.status(404).json({
        error: 'Integration not found',
        message: 'Please connect your GitHub account first'
      });
    }

    const { accessToken } = integration.credentials;
    console.log('Access token exists:', !!accessToken);

    // Primero verifica que el token sea válido
    try {
      const userResponse = await axios.get('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      console.log('GitHub token is valid, user:', userResponse.data.login);
    } catch (tokenError) {
      console.error('GitHub token validation error:', tokenError.response?.data);
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Please reconnect your GitHub account'
      });
    }

    // Obtener issues y PRs con milestone (que tienen fecha)
    const issuesResponse = await axios.get(
      'https://api.github.com/search/issues',
      {
        headers: {
          'Authorization': `token ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json'
        },
        params: {
          q: 'assignee:@me milestone:*',
          per_page: 100
        }
      }
    );

    // Transformar a formato de eventos
    const events = await Promise.all(issuesResponse.data.items.map(async item => {
      // Obtener el milestone para la fecha
      const milestoneUrl = item.milestone.url;
      const milestoneResponse = await axios.get(milestoneUrl, {
        headers: {
          'Authorization': `token ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      return {
        id: `github-${item.id}`,
        title: item.title,
        description: item.body,
        date: milestoneResponse.data.due_on,
        status: item.state,
        priority: getPriorityFromLabels(item.labels),
        project: item.repository_url.split('/').slice(-1)[0],
        url: item.html_url,
        source: 'github',
        type: item.pull_request ? 'pull-request' : 'issue'
      };
    }));

    res.json(events);

  } catch (error) {
    console.error('Error fetching GitHub calendar events:', error.response?.data || error);
    res.status(500).json({
      error: 'Failed to fetch calendar events',
      message: error.message
    });
  }
});

function getPriorityFromLabels(labels) {
  const labelNames = labels.map(label => label.name.toLowerCase());
  
  if (labelNames.some(name => 
    name.includes('high') || 
    name.includes('urgent') || 
    name.includes('priority/high') ||
    name.includes('priority-high')
  )) {
    return 'high';
  }
  
  if (labelNames.some(name => 
    name.includes('low') || 
    name.includes('minor') || 
    name.includes('priority/low') ||
    name.includes('priority-low')
  )) {
    return 'low';
  }
  
  return 'medium';
}


module.exports = router;