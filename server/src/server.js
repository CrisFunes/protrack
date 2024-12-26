require('dotenv').config();

const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const Integration = require('./models/Integration');

const app = express();
const port = process.env.PORT || 3000;

// Middleware de configuración
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Middleware de logging
app.use((req, res, next) => {
  console.log('Incoming request:', {
    method: req.method,
    path: req.path,
    body: req.body,
    headers: req.headers
  });
  next();
});

// Conexión a MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

connectDB();

// Rutas base
app.use('/api/auth', authRoutes);

// Ruta de prueba de DB
app.get('/api/db-status', async (req, res) => {
  try {
    const status = {
      mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      details: {
        host: mongoose.connection.host,
        name: mongoose.connection.name
      }
    };
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: 'Error checking database status' });
  }
});

// Rutas de integración
// Estado de todas las integraciones
app.get('/api/integrations/status', async (req, res) => {
  try {
    // Verificar la conexión a MongoDB
    if (mongoose.connection.readyState !== 1) {
      console.error('MongoDB not connected');
      return res.status(500).json({ error: 'Database connection not available' });
    }

    // Inicializar status con valores por defecto
    const defaultStatus = {
      jira: { connected: false, lastSync: null },
      slack: { connected: false, lastSync: null },
      bitbucket: { connected: false, lastSync: null },
      github: { connected: false, lastSync: null },
      trello: { connected: false, lastSync: null }
    };

    try {
      // Intentar obtener integraciones existentes
      const integrations = await Integration.find({ userId: req.user?.id || 'demo' });
      
      // Actualizar el status por defecto con las integraciones encontradas
      integrations.forEach(integration => {
        if (defaultStatus[integration.service]) {
          defaultStatus[integration.service] = {
            connected: integration.isConnected,
            lastSync: integration.lastSync
          };
        }
      });

      res.json(defaultStatus);
    } catch (dbError) {
      console.error('Error querying integrations:', dbError);
      // Si hay error en la consulta, devolver al menos el status por defecto
      res.json(defaultStatus);
    }
  } catch (error) {
    console.error('Error in integration status route:', error);
    res.status(500).json({ 
      error: 'Failed to fetch integrations status',
      details: error.message 
    });
  }
});

// Desconectar una integración
app.post('/api/integrations/:service/disconnect', async (req, res) => {
  try {
    const { service } = req.params;
    await Integration.findOneAndUpdate(
      { userId: req.user?.id || 'demo', service },
      { isConnected: false },
      { new: true }
    );
    res.json({ message: `${service} disconnected successfully` });
  } catch (error) {
    console.error(`Error disconnecting ${req.params.service}:`, error);
    res.status(500).json({ error: `Failed to disconnect ${req.params.service}` });
  }
});

// Sincronizar una integración
app.post('/api/integrations/:service/sync', async (req, res) => {
  try {
    const { service } = req.params;
    const integration = await Integration.findOne({
      userId: req.user?.id || 'demo',
      service,
      isConnected: true
    });

    if (!integration) {
      return res.status(404).json({ error: `${service} integration not found or not connected` });
    }

    // Aquí irían las llamadas específicas para sincronizar cada servicio
    const lastSync = new Date();
    integration.lastSync = lastSync;
    await integration.save();

    res.json({ message: `${service} synced successfully`, lastSync });
  } catch (error) {
    console.error(`Error syncing ${req.params.service}:`, error);
    res.status(500).json({ error: `Failed to sync ${req.params.service}` });
  }
});

// Rutas específicas de Jira
app.get('/api/jira/projects', async (req, res) => {
  try {
    const integration = await Integration.findOne({
      userId: req.user?.id || 'demo',
      service: 'jira',
      isConnected: true
    });

    if (!integration) {
      return res.status(404).json({ error: 'Jira integration not found or not connected' });
    }

    const { baseUrl, email, apiToken } = integration.credentials;

    const response = await axios.get(`${baseUrl}/rest/api/3/project`, {
      auth: { username: email, password: apiToken }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching Jira projects:', error);
    res.status(500).json({ error: 'Failed to fetch Jira projects' });
  }
});

// Conectar Jira
app.post('/api/integrations/jira/connect', async (req, res) => {
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
      { userId: req.user?.id || 'demo', service: 'jira' },
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

// Middleware de manejo de errores
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something broke!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

app.use(errorHandler);

// Manejo de promesas no controladas
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Dar tiempo para el logging antes de cerrar
  setTimeout(() => {
    server.close(() => process.exit(1));
  }, 1000);
});

const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = server;