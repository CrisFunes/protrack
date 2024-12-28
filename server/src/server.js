require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const integrationRoutes = require('./routes/integrations');
const auth = require('./middleware/auth');
const githubRoutes = require('./routes/github');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Logging middleware
app.use((req, res, next) => {
  console.log('Incoming request:', {
    method: req.method,
    path: req.path,
    headers: req.headers
  });
  next();
});

// Database connection
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

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/integrations/github', githubRoutes);

// DB Status route
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

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something broke!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

app.use(errorHandler);

// Unhandled promise rejection handler
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  setTimeout(() => {
    server.close(() => process.exit(1));
  }, 1000);
});

const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = server;