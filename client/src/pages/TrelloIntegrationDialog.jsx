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

const TrelloIntegrationDialog = ({ open, onClose, onConnect }) => {
  const [formData, setFormData] = useState({
    apiKey: '',
    token: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value.trim()
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/integrations/trello/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to connect to Trello');
      }

      onConnect(data);
      onClose();
    } catch (err) {
      setError(err.message);
      console.error('Error connecting to Trello:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTokenUrl = () => {
    if (!formData.apiKey) return '#';
    return `https://trello.com/1/authorize?expiration=never&name=YourAppName&scope=read,write&response_type=token&key=${formData.apiKey}`;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Connect to Trello</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          To connect with Trello, you'll need your API Key and Token. Follow these steps:
        </Typography>
        
        <Box component="ol" sx={{ mb: 2 }}>
          <li>
            <Typography variant="body2">
              Get your API Key from{' '}
              <Link href="https://trello.com/app-key" target="_blank" rel="noopener">
                Trello's Developer API Keys page
              </Link>
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              Enter your API Key below and then click{' '}
              <Link href={getTokenUrl()} target="_blank" rel="noopener" 
                    sx={{ pointerEvents: formData.apiKey ? 'auto' : 'none' }}>
                here
              </Link>
              {' '}to get your Token (you'll need to enter the API Key first)
            </Typography>
          </li>
        </Box>

        <TextField
          name="apiKey"
          label="API Key"
          fullWidth
          margin="normal"
          value={formData.apiKey}
          onChange={handleChange}
          disabled={loading}
        />
        <TextField
          name="token"
          label="Token"
          fullWidth
          margin="normal"
          type="password"
          value={formData.token}
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
          disabled={loading || !formData.apiKey || !formData.token}
        >
          {loading ? 'Connecting...' : 'Connect'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TrelloIntegrationDialog;