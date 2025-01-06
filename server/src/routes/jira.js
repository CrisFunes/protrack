const express = require('express');
const router = express.Router();
const Integration = require('../models/Integration');
const axios = require('axios');
const auth = require('../middleware/auth');

// Conectar Jira
router.post('/connect', auth, async (req, res) => {
  try {
    const { baseUrl, email, apiToken } = req.body;

    // Verificar las credenciales con Jira
    const testResponse = await axios.get(`${baseUrl}/rest/api/3/myself`, {
      auth: { username: email, password: apiToken }
    });

    if (testResponse.status !== 200) {
      throw new Error('Invalid Jira credentials');
    }

    // Guardar o actualizar la integración
    const integration = await Integration.findOneAndUpdate(
      { userId: req.user.id, service: 'jira' },
      {
        credentials: { baseUrl, email, apiToken },
        isConnected: true,
        lastSync: new Date()
      },
      { upsert: true, new: true }
    );

    res.json({
      message: 'Jira connected successfully',
      integration: {
        id: integration._id,
        isConnected: integration.isConnected,
        lastSync: integration.lastSync
      }
    });
  } catch (error) {
    console.error('Jira connection error:', error);
    res.status(400).json({
      error: 'Failed to connect to Jira',
      details: error.message
    });
  }
});

// Obtener proyectos de Jira
router.get('/projects', auth, async (req, res) => {
  try {
    console.log('Fetching Jira projects for user:', req.user.userId);

    const integration = await Integration.findOne({
      userId: req.user.userId, // Usar userId del middleware auth
      service: 'jira',
      isConnected: true
    });

    if (!integration) {
      return res.status(404).json({
        error: 'Integration not found',
        message: 'Please connect your Jira account first'
      });
    }

    const { baseUrl, email, apiToken } = integration.credentials;

    const response = await axios.get(`${baseUrl}/rest/api/3/project`, {
      auth: { username: email, password: apiToken }
    });

    // Transformar los proyectos al formato esperado
    const projects = response.data.map(project => ({
      id: project.id,
      name: project.name,
      key: project.key,
      description: project.description || '',
      avatarUrls: project.avatarUrls,
      private: project.private || false,
      source: 'jira'
    }));

    // Actualizar lastSync
    await Integration.findByIdAndUpdate(integration._id, {
      lastSync: new Date()
    });

    res.json(projects);

  } catch (error) {
    console.error('Error fetching Jira projects:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      await Integration.findOneAndUpdate(
        { userId: req.user.userId, service: 'jira' },
        { isConnected: false }
      );
      
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Please reconnect your Jira account'
      });
    }

    res.status(500).json({
      error: 'Failed to fetch projects',
      message: error.message
    });
  }
});

router.get('/tasks', auth, async (req, res) => {
  try {
    const integration = await Integration.findOne({
      userId: req.user.userId,
      service: 'jira',
      isConnected: true
    });

    if (!integration) {
      return res.status(404).json({
        error: 'Integration not found',
        message: 'Please connect your Jira account first'
      });
    }

    const { baseUrl, email, apiToken } = integration.credentials;

    // Obtener issues asignadas al usuario
    const response = await axios.get(`${baseUrl}/rest/api/3/search`, {
      auth: { username: email, password: apiToken },
      params: {
        jql: 'assignee was not EMPTY ORDER BY updated DESC',
        maxResults: 50,
        fields: 'summary,status,priority,assignee,updated,project'
      }
    });

    const tasks = response.data.issues.map(issue => ({
      id: issue.id,
      key: issue.key,
      title: issue.fields.summary,
      status: issue.fields.status.name,
      priority: issue.fields.priority.name,
      updated: issue.fields.updated,
      project: issue.fields.project.name,
      source: 'jira',
      url: `${baseUrl}/browse/${issue.key}`
    }));

    res.json(tasks);

  } catch (error) {
    console.error('Error fetching Jira tasks:', error.response?.data || error);
    res.status(500).json({
      error: 'Failed to fetch tasks',
      message: error.message
    });
  }
});

router.get('/calendar-events', auth, async (req, res) => {
  try {
    const integration = await Integration.findOne({
      userId: req.user.userId,
      service: 'jira',
      isConnected: true
    });

    if (!integration) {
      return res.status(404).json({
        error: 'Integration not found',
        message: 'Please connect your Jira account first'
      });
    }

    const { baseUrl, email, apiToken } = integration.credentials;

    // Obtener issues con fechas de vencimiento
    const response = await axios.get(`${baseUrl}/rest/api/3/search`, {
      auth: { username: email, password: apiToken },
      params: {
        jql: 'duedate >= startOfMonth() AND duedate <= endOfMonth()',
        fields: 'summary,duedate,status,priority,assignee,project'
      }
    });

    // Transformar las issues en eventos
    const events = response.data.issues.map(issue => ({
      id: issue.id,
      title: issue.fields.summary,
      date: issue.fields.duedate,
      status: issue.fields.status.name,
      priority: issue.fields.priority.name,
      project: issue.fields.project.name,
      type: 'due-date',
      source: 'jira',
      url: `${baseUrl}/browse/${issue.key}`
    }));

    res.json(events);

  } catch (error) {
    console.error('Error fetching Jira calendar events:', error.response?.data || error);
    res.status(500).json({
      error: 'Failed to fetch calendar events',
      message: error.message
    });
  }
});

// En jira.js
router.get('/stats', auth, async (req, res) => {
  try {
    console.log('Fetching Jira stats for user:', req.user.userId);

    const integration = await Integration.findOne({
      userId: req.user.userId,
      service: 'jira',
      isConnected: true
    });

    console.log('Found Jira integration:', !!integration);

    if (!integration) {
      return res.status(404).json({
        error: 'Integration not found',
        message: 'Please connect your Jira account first'
      });
    }

    const { baseUrl, email, apiToken } = integration.credentials;

    // Verificar que tenemos todas las credenciales necesarias
    if (!baseUrl || !email || !apiToken) {
      console.error('Missing Jira credentials:', { hasBaseUrl: !!baseUrl, hasEmail: !!email, hasApiToken: !!apiToken });
      return res.status(400).json({
        error: 'Invalid credentials',
        message: 'Missing required Jira credentials'
      });
    }

    // Primero verificar que podemos conectarnos a Jira
    try {
      await axios.get(`${baseUrl}/rest/api/3/myself`, {
        auth: { username: email, password: apiToken }
      });
      console.log('Jira connection verified successfully');
    } catch (authError) {
      console.error('Jira authentication failed:', authError.response?.data);
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Failed to authenticate with Jira'
      });
    }

    // Obtener todas las issues asignadas al usuario
    const response = await axios.get(`${baseUrl}/rest/api/3/search`, {
      auth: { username: email, password: apiToken },
      params: {
        jql: 'assignee was not EMPTY ORDER BY updated DESC',
        fields: 'summary,status,priority,assignee,updated,project,issuetype'
      }
    });

    const issues = response.data.issues;
    console.log(`Found ${issues.length} Jira issues`);

    // Normalizar estados
    const normalizeStatus = (status) => {
      const statusKey = status.statusCategory.key.toLowerCase();
      if (statusKey === 'new') return 'todo';
      if (statusKey === 'indeterminate') return 'inProgress';
      if (statusKey === 'done') return 'done';
      return 'other';
    };

    // Normalizar prioridad
    const normalizePriority = (priority) => {
      const priorityId = parseInt(priority.id);
      if (priorityId <= 2) return 'high';
      if (priorityId === 3) return 'medium';
      return 'low';
    };

    // Calcular estadísticas
    const stats = {
      tasks: {
        total: issues.length,
        todo: issues.filter(i => normalizeStatus(i.fields.status) === 'todo').length,
        inProgress: issues.filter(i => normalizeStatus(i.fields.status) === 'inProgress').length,
        done: issues.filter(i => normalizeStatus(i.fields.status) === 'done').length,
        byStatus: [
          { name: 'To Do', value: issues.filter(i => normalizeStatus(i.fields.status) === 'todo').length },
          { name: 'In Progress', value: issues.filter(i => normalizeStatus(i.fields.status) === 'inProgress').length },
          { name: 'Done', value: issues.filter(i => normalizeStatus(i.fields.status) === 'done').length }
        ],
        byPriority: [
          { name: 'High', value: issues.filter(i => normalizePriority(i.fields.priority) === 'high').length },
          { name: 'Medium', value: issues.filter(i => normalizePriority(i.fields.priority) === 'medium').length },
          { name: 'Low', value: issues.filter(i => normalizePriority(i.fields.priority) === 'low').length }
        ]
      },
      recentActivities: issues
        .slice(0, 5)
        .map(issue => ({
          id: issue.id,
          description: issue.fields.summary,
          type: issue.fields.issuetype.name,
          date: issue.fields.updated,
          source: 'jira',
          project: issue.fields.project.name
        }))
    };

    console.log('Successfully processed Jira stats');
    res.json(stats);

  } catch (error) {
    console.error('Error fetching Jira stats:', {
      message: error.message,
      response: error.response?.data,
      stack: error.stack
    });

    // Respuesta de error más detallada
    res.status(500).json({
      error: 'Failed to fetch Jira stats',
      message: error.message,
      details: error.response?.data || error.stack
    });
  }
});

module.exports = router;