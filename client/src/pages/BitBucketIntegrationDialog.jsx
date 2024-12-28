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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box
} from '@mui/material';
import { CheckCircleOutline } from '@mui/icons-material';

const BitbucketIntegrationDialog = ({ open, onClose, onConnect }) => {
  const [formData, setFormData] = useState({
    username: '',
    appPassword: ''
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

      const response = await fetch('/api/integrations/bitbucket/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to connect to Bitbucket');
      }

      onConnect(data);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to connect to Bitbucket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Connect to Bitbucket</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          To connect with Bitbucket, you'll need your username and an app password. You can create an app password in your{' '}
          <Link href="https://bitbucket.org/account/settings/app-passwords/" target="_blank" rel="noopener">
            Bitbucket Settings
          </Link>
          .
        </Typography>

        <Box sx={{ mb: 3, bgcolor: 'background.paper', p: 2, borderRadius: 1 }}>
          <Typography variant="subtitle2" color="primary" gutterBottom>
            Required Permissions:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon>
                <CheckCircleOutline color="primary" fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Account" 
                secondary="Email and Read"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleOutline color="primary" fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Repositories" 
                secondary="Read"
              />
            </ListItem>
          </List>
          <Typography variant="caption" color="text.secondary">
            Make sure to select these permissions when creating your app password.
          </Typography>
        </Box>

        <TextField
          name="username"
          label="Username"
          fullWidth
          margin="normal"
          value={formData.username}
          onChange={handleChange}
          helperText="Your Bitbucket username"
          disabled={loading}
        />
        <TextField
          name="appPassword"
          label="App Password"
          fullWidth
          margin="normal"
          type="password"
          value={formData.appPassword}
          onChange={handleChange}
          helperText="Enter your Bitbucket App Password"
          disabled={loading}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={loading || !formData.username || !formData.appPassword}
        >
          {loading ? 'Connecting...' : 'Connect'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BitbucketIntegrationDialog;