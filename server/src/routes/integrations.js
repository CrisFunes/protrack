const express = require('express');
const router = express.Router();
const Integration = require('../models/Integration');
const auth = require('../middleware/auth');
const axios = require('axios');

// Get all integrations status for the current user
router.get('/status', auth, async (req, res) => {
  try {
    const integrations = await Integration.find({ userId: req.user.id });
    
    const defaultStatus = {
      jira: { connected: false, lastSync: null },
      slack: { connected: false, lastSync: null },
      bitbucket: { connected: false, lastSync: null },
      github: { connected: false, lastSync: null },
      trello: { connected: false, lastSync: null }
    };

    integrations.forEach(integration => {
      if (defaultStatus[integration.service]) {
        defaultStatus[integration.service] = {
          connected: integration.isConnected,
          lastSync: integration.lastSync
        };
      }
    });

    res.json(defaultStatus);
  } catch (error) {
    console.error('Error fetching integrations:', error);
    res.status(500).json({ error: 'Failed to fetch integrations' });
  }
});

// Connect Jira
router.post('/jira/connect', auth, async (req, res) => {
    try {
      const { baseUrl, email, apiToken } = req.body;
      const userId = req.user.id; // Usar el ID del usuario del token
  
      // Log para debugging
      console.log('Connecting Jira for user:', userId);
  
      // Verificar las credenciales con Jira
      const testResponse = await axios.get(`${baseUrl}/rest/api/3/myself`, {
        auth: { username: email, password: apiToken }
      });
  
      if (testResponse.status !== 200) {
        throw new Error('Invalid Jira credentials');
      }
  
      // Guardar o actualizar la integración con el userId
      const integration = await Integration.findOneAndUpdate(
        { userId, service: 'jira' },
        {
          userId, // Asegurarnos de que se guarda el userId
          credentials: { baseUrl, email, apiToken },
          isConnected: true,
          lastSync: new Date()
        },
        { upsert: true, new: true }
      );
  
      // Log para verificar
      console.log('Integration saved with userId:', integration.userId);
  
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

// Disconnect integration
router.post('/:service/disconnect', auth, async (req, res) => {
  try {
    const { service } = req.params;
    const userId = req.user.id;

    await Integration.findOneAndUpdate(
      { userId, service },
      { isConnected: false },
      { new: true }
    );

    res.json({ message: `${service} disconnected successfully` });
  } catch (error) {
    console.error('Disconnect error:', error);
    res.status(500).json({ error: 'Failed to disconnect integration' });
  }
});

// Sync integration
router.post('/:service/sync', auth, async (req, res) => {
  try {
    const { service } = req.params;
    const userId = req.user.id;

    const integration = await Integration.findOne({
      userId,
      service,
      isConnected: true
    });

    if (!integration) {
      return res.status(404).json({ error: 'Integration not found or not connected' });
    }

    // Here you would implement specific sync logic for each service
    const lastSync = new Date();
    integration.lastSync = lastSync;
    await integration.save();

    res.json({ message: `${service} synced successfully`, lastSync });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ error: 'Failed to sync integration' });
  }
});

router.get('/jira/projects', auth, async (req, res) => {
    try {
      // Buscar la integración de Jira para el usuario actual
      const integration = await Integration.findOne({
        userId: req.user.id,
        service: 'jira',
        isConnected: true
      });
  
      if (!integration) {
        return res.status(404).json({ 
          error: 'Jira integration not found',
          message: 'Please connect your Jira account first'
        });
      }
  
      // Obtener los proyectos usando las credenciales almacenadas
      const { baseUrl, email, apiToken } = integration.credentials;
  
      const response = await axios.get(`${baseUrl}/rest/api/3/project`, {
        auth: {
          username: email,
          password: apiToken
        }
      });
  
      // Actualizar lastSync
      integration.lastSync = new Date();
      await integration.save();
  
      res.json(response.data);
    } catch (error) {
      console.error('Error fetching Jira projects:', error);
      
      // Manejar diferentes tipos de errores
      if (error.response?.status === 401) {
        return res.status(401).json({ 
          error: 'Invalid Jira credentials',
          message: 'Please reconnect your Jira account'
        });
      }
  
      res.status(500).json({ 
        error: 'Failed to fetch Jira projects',
        message: error.message
      });
    }
  });
  
  module.exports = router;