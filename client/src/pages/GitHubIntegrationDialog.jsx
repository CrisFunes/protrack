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
  Link
} from '@mui/material';

const GitHubIntegrationDialog = ({ open, onClose, onConnect }) => {
  const [accessToken, setAccessToken] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/integrations/github/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ accessToken })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to connect to GitHub');
      }

      const data = await response.json();
      onConnect(data);
      onClose();
    } catch (err) {
      setError(err.message);
      console.error('Error connecting to GitHub:', err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Connect to GitHub</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          To connect with GitHub, you'll need a personal access token. You can create one in your{' '}
          <Link href="https://github.com/settings/tokens" target="_blank" rel="noopener">
            GitHub Settings
          </Link>
          . Make sure to enable the 'repo' and 'user' scopes.
        </Typography>
        <TextField
          label="Personal Access Token"
          fullWidth
          margin="normal"
          type="password"
          value={accessToken}
          onChange={(e) => setAccessToken(e.target.value)}
          helperText="Enter your GitHub Personal Access Token"
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

export default GitHubIntegrationDialog;