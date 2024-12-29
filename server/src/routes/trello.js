const express = require('express');
const router = express.Router();
const Integration = require('../models/Integration');
const axios = require('axios');
const auth = require('../middleware/auth');

// Conectar Trello
router.post('/connect', auth, async (req, res) => {
  try {
    const { apiKey, token } = req.body;

    if (!apiKey || !token) {
      return res.status(400).json({
        error: 'Missing credentials',
        message: 'Both API Key and Token are required'
      });
    }

    // Verificar las credenciales con Trello
    try {
      // Verificar el token probando obtener el usuario
      const testResponse = await axios.get(`https://api.trello.com/1/members/me?key=${apiKey}&token=${token}`);

      if (testResponse.status !== 200) {
        throw new Error('Invalid Trello credentials');
      }

      // Guardar la integración
      const integration = await Integration.findOneAndUpdate(
        { 
          userId: req.user.id, 
          service: 'trello'
        },
        {
          credentials: { apiKey, token },
          isConnected: true,
          lastSync: new Date()
        },
        { upsert: true, new: true }
      );

      console.log('Trello integration saved successfully');

      res.json({
        message: 'Trello connected successfully',
        integration: {
          id: integration._id,
          isConnected: true,
          lastSync: integration.lastSync
        }
      });

    } catch (apiError) {
      console.error('Trello API error:', apiError.response?.data || apiError.message);
      res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid Trello credentials'
      });
    }

  } catch (error) {
    console.error('Trello connection error:', error);
    res.status(500).json({
      error: 'Connection failed',
      message: error.message
    });
  }
});

// Obtener tableros
router.get('/boards', auth, async (req, res) => {
  try {
    const integration = await Integration.findOne({
      userId: req.user.id,
      service: 'trello',
      isConnected: true
    });

    if (!integration) {
      return res.status(404).json({
        error: 'Integration not found',
        message: 'Trello integration not found or not connected'
      });
    }

    const { apiKey, token } = integration.credentials;

    const response = await axios.get('https://api.trello.com/1/members/me/boards', {
      params: {
        key: apiKey,
        token: token,
        fields: 'name,desc,url,closed,dateLastActivity'
      }
    });

    // Transformar los tableros al formato esperado
    const boards = response.data.map(board => ({
      id: board.id,
      name: board.name,
      description: board.desc || '',
      url: board.url,
      lastActivity: board.dateLastActivity,
      isActive: !board.closed,
      source: 'trello'
    }));

    res.json(boards);

  } catch (error) {
    console.error('Error fetching Trello boards:', error);
    
    if (error.response?.status === 401) {
      await Integration.findOneAndUpdate(
        { userId: req.user.id, service: 'trello' },
        { isConnected: false }
      );
      
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Please reconnect your Trello account'
      });
    }

    res.status(500).json({
      error: 'Failed to fetch boards',
      message: error.message
    });
  }
});

module.exports = router;