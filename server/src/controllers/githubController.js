import axios from 'axios';
import User from '../models/User';
import Integration from '../models/Integration';
import { encryptToken, decryptToken } from '../utils/encryption';

export const getGitHubStatus = async (req, res) => {
  try {
    const integration = await Integration.findOne({
      user: req.user.id,
      platform: 'github'
    });
    
    res.json({ connected: !!integration });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const handleOAuthCallback = async (req, res) => {
  const { code } = req.query;
  
  try {
    // Exchange code for access token
    const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code
    }, {
      headers: {
        Accept: 'application/json'
      }
    });

    const { access_token } = tokenResponse.data;

    // Get user info from GitHub
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    });

    // Save or update integration
    await Integration.findOneAndUpdate(
      { user: req.user.id, platform: 'github' },
      {
        token: encryptToken(access_token),
        platformUserId: userResponse.data.id.toString(),
        platformUsername: userResponse.data.login
      },
      { upsert: true }
    );

    res.redirect('/settings/integrations?status=success');
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    res.redirect('/settings/integrations?status=error');
  }
};

export const disconnectGitHub = async (req, res) => {
  try {
    await Integration.findOneAndDelete({
      user: req.user.id,
      platform: 'github'
    });
    
    res.json({ message: 'GitHub disconnected successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getRepositories = async (req, res) => {
  try {
    const integration = await Integration.findOne({
      user: req.user.id,
      platform: 'github'
    });

    if (!integration) {
      return res.status(404).json({ error: 'GitHub integration not found' });
    }

    const token = decryptToken(integration.token);

    const response = await axios.get('https://api.github.com/user/repos', {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {
        sort: 'updated',
        per_page: 100
      }
    });

    const repositories = response.data.map(repo => ({
      id: repo.id,
      name: repo.name,
      description: repo.description,
      url: repo.html_url,
      private: repo.private,
      updated_at: repo.updated_at
    }));

    res.json(repositories);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching repositories' });
  }
};
