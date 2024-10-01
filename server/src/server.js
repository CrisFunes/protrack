require('dotenv').config();

const express = require('express');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

// Jira credentials from .env file
const jiraBaseUrl = process.env.JIRA_BASE_URL;
const jiraEmail = process.env.JIRA_EMAIL;
const jiraToken = process.env.JIRA_API_TOKEN;

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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
