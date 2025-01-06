import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  Typography,
  Link,
  Box
} from '@mui/material';

const JiraIntegrationDialog = ({ open, onClose, onConnect }) => {
  const [formData, setFormData] = useState({
    baseUrl: '',
    email: '',
    apiToken: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/integrations/jira/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to connect to Jira');
      }

      const data = await response.json();
      onConnect(data);
      onClose();
    } catch (err) {
      setError(err.message);
      console.error('Error connecting to Jira:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value.trim()
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Connect to Jira</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          To connect with Jira, you'll need your Base URL, Email, and API Token. Follow these steps:
        </Typography>
        
        <Box component="ol" sx={{ mb: 2 }}>
          <li>
            <Typography variant="body2">
              Get your Jira Base URL (e.g., https://your-domain.atlassian.net)
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              Use the email associated with your Atlassian account
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              Generate an API Token from{' '}
              <Link 
                href="https://id.atlassian.com/manage-profile/security/api-tokens" 
                target="_blank" 
                rel="noopener"
              >
                Atlassian's Security Settings
              </Link>
            </Typography>
          </li>
        </Box>

        <TextField
          name="baseUrl"
          label="Jira Base URL"
          fullWidth
          margin="normal"
          placeholder="https://your-domain.atlassian.net"
          value={formData.baseUrl}
          onChange={handleChange}
          disabled={loading}
        />
        <TextField
          name="email"
          label="Email"
          fullWidth
          margin="normal"
          value={formData.email}
          onChange={handleChange}
          disabled={loading}
        />
        <TextField
          name="apiToken"
          label="API Token"
          fullWidth
          margin="normal"
          type="password"
          value={formData.apiToken}
          onChange={handleChange}
          disabled={loading}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={loading || !formData.baseUrl || !formData.email || !formData.apiToken}
        >
          {loading ? 'Connecting...' : 'Connect'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default JiraIntegrationDialog;