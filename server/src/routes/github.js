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
  
module.exports = router;