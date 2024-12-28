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
      return res.status(404).json({ error: 'GitHub integration not found' });
    }

    const { accessToken } = integration.credentials;

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

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching GitHub repositories:', error);
    res.status(500).json({
      error: 'Failed to fetch GitHub repositories',
      details: error.message
    });
  }
});

module.exports = router;