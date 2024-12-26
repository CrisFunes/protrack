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
    const integration = await Integration.findOne({
      userId: req.user.id,
      service: 'jira',
      isConnected: true
    });

    if (!integration) {
      return res.status(404).json({ error: 'Jira integration not found' });
    }

    const { baseUrl, email, apiToken } = integration.credentials;

    const response = await axios.get(`${baseUrl}/rest/api/3/project`, {
      auth: { username: email, password: apiToken }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching Jira projects:', error);
    res.status(500).json({
      error: 'Failed to fetch Jira projects',
      details: error.message
    });
  }
});

module.exports = router;