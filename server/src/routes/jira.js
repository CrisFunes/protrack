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

module.exports = router;