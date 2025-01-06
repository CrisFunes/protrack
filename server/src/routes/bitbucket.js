const express = require('express');
const router = express.Router();
const Integration = require('../models/Integration');
const axios = require('axios');
const auth = require('../middleware/auth');

// Conectar Bitbucket
router.post('/connect', auth, async (req, res) => {
  try {
    const { username, appPassword } = req.body;
    console.log('Attempting to connect Bitbucket for user:', username);

    // Validar las credenciales
    if (!username || !appPassword) {
      return res.status(400).json({
        error: 'Missing credentials',
        message: 'Both username and app password are required'
      });
    }

    // Verificar las credenciales con Bitbucket
    try {
      const testResponse = await axios({
        method: 'get',
        url: 'https://api.bitbucket.org/2.0/user',
        auth: {
          username: username,
          password: appPassword
        },
        headers: {
          'Accept': 'application/json'
        }
      });

      if (testResponse.status !== 200) {
        throw new Error('Invalid Bitbucket credentials');
      }

      // Guardar la integración
      const integration = await Integration.findOneAndUpdate(
        {
          userId: req.user.id,
          service: 'bitbucket'
        },
        {
          userId: req.user.id,
          service: 'bitbucket',
          credentials: { username, appPassword },
          isConnected: true,
          lastSync: new Date()
        },
        { upsert: true, new: true }
      );

      console.log('Bitbucket integration saved successfully');

      res.json({
        message: 'Bitbucket connected successfully',
        integration: {
          id: integration._id,
          isConnected: true,
          lastSync: integration.lastSync
        }
      });
    } catch (apiError) {
      console.error('Bitbucket API error:', apiError.response?.data || apiError.message);
      res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid Bitbucket credentials'
      });
    }
  } catch (error) {
    console.error('Bitbucket connection error:', error);
    res.status(500).json({
      error: 'Connection failed',
      message: error.message
    });
  }
});

// Obtener repositorios
router.get('/repositories', auth, async (req, res) => {
  try {
    const integration = await Integration.findOne({
      userId: req.user.id,
      service: 'bitbucket',
      isConnected: true
    });

    if (!integration) {
      return res.status(404).json({
        error: 'Integration not found',
        message: 'Bitbucket integration not found or not connected'
      });
    }

    const { username, appPassword } = integration.credentials;

    const response = await axios({
      method: 'get',
      url: 'https://api.bitbucket.org/2.0/repositories',
      auth: {
        username: username,
        password: appPassword
      },
      params: {
        role: 'member',
        pagelen: 100
      },
      headers: {
        'Accept': 'application/json'
      }
    });

    const repositories = response.data.values.map(repo => ({
      id: repo.uuid,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description || '',
      private: repo.is_private,
      updated_at: repo.updated_on,
      language: repo.language || 'Not specified',
      forks_count: repo.forks_count || 0,
      source: 'bitbucket'
    }));

    res.json(repositories);
  } catch (error) {
    console.error('Error fetching Bitbucket repositories:', error);

    // Si es un error de autenticación, actualizar el estado de la integración
    if (error.response?.status === 401) {
      await Integration.findOneAndUpdate(
        { userId: req.user.id, service: 'bitbucket' },
        { isConnected: false }
      );

      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Please reconnect your Bitbucket account'
      });
    }

    res.status(500).json({
      error: 'Failed to fetch repositories',
      message: error.message
    });
  }
});

// Agregar este endpoint en bitbucket.js
router.get('/tasks', auth, async (req, res) => {
  try {
    const integration = await Integration.findOne({
      userId: req.user.userId,
      service: 'bitbucket',
      isConnected: true
    });

    if (!integration) {
      return res.status(404).json({
        error: 'Integration not found',
        message: 'Please connect your Bitbucket account first'
      });
    }

    const { username, appPassword } = integration.credentials;
    const auth = Buffer.from(`${username}:${appPassword}`).toString('base64');

    // Obtener PRs
    const prsResponse = await axios({
      method: 'get',
      url: `https://api.bitbucket.org/2.0/pullrequests/${username}`,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json'
      }
    });

    // Obtener Issues
    const issuesResponse = await axios({
      method: 'get',
      url: `https://api.bitbucket.org/2.0/repositories/${username}/issues`,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json'
      },
      params: {
        q: 'assignee.username="' + username + '"'
      }
    });

    // Transformar Pull Requests
    const pullRequests = prsResponse.data.values.map(pr => ({
      id: pr.id,
      title: pr.title,
      description: pr.description || '',
      status: pr.state,
      priority: 'medium', // Bitbucket PRs no tienen prioridad por defecto
      project: pr.destination.repository.name,
      url: pr.links.html.href,
      source: 'bitbucket',
      type: 'pull-request',
      created_on: pr.created_on,
      updated_on: pr.updated_on
    }));

    // Transformar Issues
    const issues = issuesResponse.data.values.map(issue => ({
      id: issue.id,
      title: issue.title,
      description: issue.content?.raw || '',
      status: issue.state,
      priority: issue.priority || 'medium',
      project: issue.repository?.name || 'Unknown',
      url: issue.links.html.href,
      source: 'bitbucket',
      type: 'issue',
      created_on: issue.created_on,
      updated_on: issue.updated_on
    }));

    // Combinar y enviar todas las tareas
    const allTasks = [...pullRequests, ...issues];
    res.json(allTasks);

  } catch (error) {
    console.error('Error fetching Bitbucket tasks:', error.response?.data || error);
    res.status(500).json({
      error: 'Failed to fetch tasks',
      message: error.message
    });
  }
});

// En bitbucket.js
router.get('/calendar-events', auth, async (req, res) => {
  try {
    const integration = await Integration.findOne({
      userId: req.user.userId,
      service: 'bitbucket',
      isConnected: true
    });

    if (!integration) {
      return res.status(404).json({
        error: 'Integration not found',
        message: 'Please connect your Bitbucket account first'
      });
    }

    const { username, appPassword } = integration.credentials;
    const auth = Buffer.from(`${username}:${appPassword}`).toString('base64');

    // Obtener issues
    const issuesResponse = await axios({
      method: 'get',
      url: `https://api.bitbucket.org/2.0/repositories/${username}/issues`,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json'
      },
      params: {
        q: 'assignee.username="' + username + '" AND deadline IS NOT null'
      }
    });

    // Obtener PRs
    const prsResponse = await axios({
      method: 'get',
      url: `https://api.bitbucket.org/2.0/repositories/${username}/pullrequests`,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json'
      },
      params: {
        q: 'author.username="' + username + '"'
      }
    });

    // Transformar issues en eventos
    const issueEvents = issuesResponse.data.values.map(issue => ({
      id: `bitbucket-issue-${issue.id}`,
      title: issue.title,
      description: issue.content?.raw || '',
      date: issue.deadline,
      status: issue.state,
      priority: issue.priority || 'medium',
      project: issue.repository?.name || 'Unknown',
      url: issue.links.html.href,
      source: 'bitbucket',
      type: 'issue'
    }));

    // Transformar PRs en eventos (solo los que tengan fecha objetivo)
    const prEvents = prsResponse.data.values
      .filter(pr => pr.target_date)
      .map(pr => ({
        id: `bitbucket-pr-${pr.id}`,
        title: pr.title,
        description: pr.description || '',
        date: pr.target_date,
        status: pr.state,
        priority: 'medium',
        project: pr.destination.repository.name,
        url: pr.links.html.href,
        source: 'bitbucket',
        type: 'pull-request'
      }));

    res.json([...issueEvents, ...prEvents]);

  } catch (error) {
    console.error('Error fetching Bitbucket calendar events:', error.response?.data || error);
    res.status(500).json({
      error: 'Failed to fetch calendar events',
      message: error.message
    });
  }
});

// En bitbucket.js
router.get('/stats', auth, async (req, res) => {
  try {
    console.log('Fetching Bitbucket stats for user:', req.user.userId);

    const integration = await Integration.findOne({
      userId: req.user.userId,
      service: 'bitbucket',
      isConnected: true
    });

    console.log('Found Bitbucket integration:', !!integration);

    if (!integration) {
      return res.status(404).json({
        error: 'Integration not found',
        message: 'Please connect your Bitbucket account first'
      });
    }

    const { username, appPassword } = integration.credentials;
    console.log('Bitbucket username:', username);

    if (!username || !appPassword) {
      return res.status(400).json({
        error: 'Invalid credentials',
        message: 'Missing username or app password'
      });
    }

    const auth = Buffer.from(`${username}:${appPassword}`).toString('base64');

    // Verificar credenciales primero
    try {
      const userResponse = await axios({
        method: 'get',
        url: 'https://api.bitbucket.org/2.0/user',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json'
        }
      });
      console.log('Bitbucket auth successful for user:', userResponse.data.username);
    } catch (authError) {
      console.error('Bitbucket auth error:', authError.response?.data);
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid Bitbucket credentials'
      });
    }

    // Obtener repositorios del usuario
    const reposResponse = await axios({
      method: 'get',
      url: `https://api.bitbucket.org/2.0/repositories/${username}`,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json'
      },
      params: {
        pagelen: 10,
        role: 'contributor'
      }
    });

    console.log(`Found ${reposResponse.data.values.length} repositories`);

    const recentCommits = [];
    const commitsByAuthor = new Map();

    // Obtener commits de cada repositorio
    for (const repo of reposResponse.data.values.slice(0, 5)) {
      console.log(`Fetching commits for repo: ${repo.name}`);
      
      try {
        const commitsResponse = await axios({
          method: 'get',
          url: `https://api.bitbucket.org/2.0/repositories/${repo.full_name}/commits`,
          headers: {
            'Authorization': `Basic ${auth}`,
            'Accept': 'application/json'
          },
          params: {
            pagelen: 10
          }
        });

        for (const commit of commitsResponse.data.values) {
          recentCommits.push({
            id: commit.hash,
            message: commit.message,
            date: commit.date,
            author: commit.author.raw,
            repository: repo.name,
            url: commit.links?.html?.href
          });

          // Contar commits por autor
          const author = commit.author.raw;
          commitsByAuthor.set(author, (commitsByAuthor.get(author) || 0) + 1);
        }
      } catch (commitError) {
        console.error(`Error fetching commits for ${repo.name}:`, commitError.response?.data);
        // Continuar con el siguiente repositorio
        continue;
      }
    }

    console.log(`Processed ${recentCommits.length} total commits`);

    // Obtener PRs
    let pullRequests = { size: 0, values: [] };
    try {
      const prsResponse = await axios({
        method: 'get',
        url: `https://api.bitbucket.org/2.0/repositories/${username}/pullrequests`,
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json'
        },
        params: {
          pagelen: 20,
          state: ['OPEN', 'MERGED', 'DECLINED'].join(',')
        }
      });
      pullRequests = prsResponse.data;
    } catch (prError) {
      console.error('Error fetching pull requests:', prError.response?.data);
      // Continuar con los datos que tengamos
    }

    // Formatear datos para la respuesta
    const stats = {
      commits: {
        total: recentCommits.length,
        byAuthor: Array.from(commitsByAuthor.entries()).map(([name, commits]) => ({
          name,
          commits
        })),
        recent: recentCommits
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 5)
      },
      pullRequests: {
        total: pullRequests.size,
        open: pullRequests.values.filter(pr => pr.state === 'OPEN').length,
        merged: pullRequests.values.filter(pr => pr.state === 'MERGED').length,
        declined: pullRequests.values.filter(pr => pr.state === 'DECLINED').length
      },
      repositories: reposResponse.data.size || reposResponse.data.values.length
    };

    console.log('Successfully compiled Bitbucket stats');
    res.json(stats);

  } catch (error) {
    console.error('Error fetching Bitbucket stats:', {
      message: error.message,
      response: error.response?.data,
      stack: error.stack
    });
    
    // Si es un error de autenticación, actualizar el estado de la integración
    if (error.response?.status === 401) {
      try {
        await Integration.findOneAndUpdate(
          { userId: req.user.userId, service: 'bitbucket' },
          { isConnected: false }
        );
      } catch (dbError) {
        console.error('Error updating integration status:', dbError);
      }
    }

    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch stats',
      message: error.message,
      details: error.response?.data
    });
  }
});

module.exports = router;