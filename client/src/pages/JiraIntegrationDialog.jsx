import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert
} from '@mui/material';

const JiraIntegrationDialog = ({ open, onClose, onConnect }) => {
  const [formData, setFormData] = useState({
    baseUrl: '',
    email: '',
    apiToken: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Obtener el token de autenticación
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
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
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
        <TextField
          name="baseUrl"
          label="Jira Base URL"
          fullWidth
          margin="normal"
          placeholder="https://your-domain.atlassian.net"
          value={formData.baseUrl}
          onChange={handleChange}
        />
        <TextField
          name="email"
          label="Email"
          fullWidth
          margin="normal"
          value={formData.email}
          onChange={handleChange}
        />
        <TextField
          name="apiToken"
          label="API Token"
          fullWidth
          margin="normal"
          type="password"
          value={formData.apiToken}
          onChange={handleChange}
          helperText="Get your API token from Atlassian account settings"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Connect
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default JiraIntegrationDialog;