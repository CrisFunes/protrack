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

module.exports = router;