require('dotenv').config();

const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth'); // Necesitarás crear este archivo

const app = express();
const port = process.env.PORT || 3000;

// Configurar middleware
app.use(express.json()); // Para parsear JSON
app.use(express.urlencoded({ extended: true })); // Para parsear URL-encoded bodies
app.use(cors({
  origin: '*', // URL de tu aplicación Vite
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Asegúrate de que esto esté antes de tus rutas
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log('Incoming request:', {
    method: req.method,
    path: req.path,
    body: req.body,
    headers: req.headers
  });
  next();
});

// Jira credentials from .env file
const jiraBaseUrl = process.env.JIRA_BASE_URL;
const jiraEmail = process.env.JIRA_EMAIL;
const jiraToken = process.env.JIRA_API_TOKEN;

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

// Middleware de manejo de errores
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something broke!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

// Rutas
app.use('/api/auth', authRoutes); // Rutas de autenticación

app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

app.get('/api/test-db', async (req, res, next) => {
  try {
    const dbStatus = mongoose.connection.readyState;
    const status = {
      isConnected: dbStatus === 1,
      state: ['disconnected', 'connected', 'connecting', 'disconnecting'][dbStatus]
    };
    res.json(status);
  } catch (error) {
    next(error);
  }
});

app.get('/', (req, res) => {
  res.send('Hello from ProTrack Server!');
});

app.get('/api/jira/projects', async (req, res) => {
    try {
        const response = await axios.get(`${jiraBaseUrl}/rest/api/3/project`, {
            auth: {
                username: jiraEmail,
                password: jiraToken,
            },
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching Jira projects:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Middleware de error al final
app.use(errorHandler);

// Manejo de promesas no controladas
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  server.close(() => process.exit(1));
});

const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

