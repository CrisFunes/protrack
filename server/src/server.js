require('dotenv').config();

const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');


const app = express();
const port = process.env.PORT || 3000;

// Jira credentials from .env file
const jiraBaseUrl = process.env.JIRA_BASE_URL;
const jiraEmail = process.env.JIRA_EMAIL;
const jiraToken = process.env.JIRA_API_TOKEN;

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

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something broke!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://localhost:27017');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

app.get('/api/test-db', async (req, res, next) => {
  try {
    // Verifica si mongoose está conectado
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
  res.send('Hello from ProTrack Serverrr!');
});

app.get('/api/jira/projects', async (req, res) => {
    try {
        const response = await axios.get(`${jiraBaseUrl}/rest/api/3/project`, {
            auth: {
                username: jiraEmail,
                password: jiraToken,
            },
        });
        res.json(response.data); // Send response back to frontend
    } catch (error) {
        console.error('Error fetching Jira projects:', error.message); // Log detailed error message
        res.status(500).json({ error: error.message });
    }
});

app.use(errorHandler);

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Close server & exit process
  app.close(() => process.exit(1));
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
