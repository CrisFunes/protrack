import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import JiraIntegrationDialog from './JiraIntegrationDialog';
import GitHubIntegrationDialog from './GitHubIntegrationDialog';
import BitBucketIntegrationDialog from './BitBucketIntegrationDialog';
import { Box, IconButton, Tooltip, Snackbar } from '@mui/material';
import { Settings, Refresh } from '@mui/icons-material';
import TrelloIntegrationDialog from './TrelloIntegrationDialog';

const Integrations = () => {
  const location = useLocation();
  const [notification, setNotification] = useState(null);
  const [integrations, setIntegrations] = useState([
    { id: 'jira', name: 'Jira', connected: false, lastSync: null },
    { id: 'slack', name: 'Slack', connected: false, lastSync: null },
    { id: 'bitbucket', name: 'BitBucket', connected: false, lastSync: null },
    { id: 'github', name: 'GitHub', connected: false, lastSync: null },
    { id: 'trello', name: 'Trello', connected: false, lastSync: null },
  ]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jiraDialogOpen, setJiraDialogOpen] = useState(false);
  const [githubDialogOpen, setGithubDialogOpen] = useState(false);
  const [bitbucketDialogOpen, setBitbucketDialogOpen] = useState(false);
  const [trelloDialogOpen, setTrelloDialogOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Manejar mensaje de reconexión desde la redirección
    if (location.state?.reconnectService && location.state?.message) {
      setNotification({
        service: location.state.reconnectService,
        message: location.state.message
      });
      
      // Marcar el servicio como desconectado
      updateIntegrationStatus(location.state.reconnectService, false);
      
      // Limpiar el estado de la ubicación
      window.history.replaceState({}, document.title);
    }
    fetchIntegrationStatus();
  }, [location]);

  const fetchIntegrationStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
  
      const response = await fetch('/api/integrations/status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch integration status');
      }
  
      const data = await response.json();
      updateIntegrationsStatus(data);
    } catch (err) {
      setError(err.message || 'Failed to load integrations status');
      console.error('Error fetching integrations:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateIntegrationsStatus = (statusData) => {
    setIntegrations(prevIntegrations => 
      prevIntegrations.map(integration => ({
        ...integration,
        connected: statusData[integration.id]?.connected || false,
        lastSync: statusData[integration.id]?.lastSync || null
      }))
    );
  };

  const handleIntegrationToggle = async (integrationId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
  
      const integration = integrations.find(i => i.id === integrationId);
      if (!integration) return;
  
      if (integration.connected) {
        const response = await fetch(`/api/integrations/${integrationId}/disconnect`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
  
        if (!response.ok) {
          throw new Error(`Failed to disconnect ${integration.name}`);
        }
  
        updateIntegrationStatus(integrationId, false);
      } else {
        switch (integrationId) {
          case 'jira':
            setJiraDialogOpen(true);
            break;
          case 'trello':
            setTrelloDialogOpen(true);
            break;
          case 'github':
            setGithubDialogOpen(true);
            break;
          case 'bitbucket':
            setBitbucketDialogOpen(true);
            break;
        }
      }
    } catch (err) {
      setError(err.message);
      console.error('Error toggling integration:', err);
    }
  };

  const handleRefresh = async (integrationId) => {
    setRefreshing(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/integrations/${integrationId}/sync`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 401 && data.code === 'TOKEN_REVOKED') {
          updateIntegrationStatus(integrationId, false);
          setNotification({
            service: integrationId,
            message: data.message || `Your ${integrationId} connection needs to be renewed. Please reconnect.`
          });
          return;
        }
        throw new Error(`Failed to sync ${integrationId}`);
      }

      const data = await response.json();
      updateIntegrationLastSync(integrationId, data.lastSync);
    } catch (err) {
      setError(`Failed to sync ${integrationId}`);
      console.error(`Error syncing ${integrationId}:`, err);
    } finally {
      setRefreshing(false);
    }
  };

  const updateIntegrationStatus = (integrationId, connected, lastSync = null) => {
    setIntegrations(prevIntegrations =>
      prevIntegrations.map(integration =>
        integration.id === integrationId
          ? { ...integration, connected, lastSync: lastSync || integration.lastSync }
          : integration
      )
    );
  };

  const updateIntegrationLastSync = (integrationId, lastSync) => {
    setIntegrations(prevIntegrations =>
      prevIntegrations.map(integration =>
        integration.id === integrationId
          ? { ...integration, lastSync }
          : integration
      )
    );
  };

  const handleJiraConnect = async (data) => {
    updateIntegrationStatus('jira', true, new Date());
    setJiraDialogOpen(false);
  };

  const handleGitHubConnect = async (data) => {
    updateIntegrationStatus('github', true, new Date());
    setGithubDialogOpen(false);
  };

  const handleBitBucketConnect = async (data) => {
    updateIntegrationStatus('bitbucket', true, new Date());
    setBitbucketDialogOpen(false);
  };

  const handleTrelloConnect = async (data) => {
    updateIntegrationStatus('trello', true, new Date());
    setTrelloDialogOpen(false);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Integrations
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {notification && (
        <Alert 
          severity="warning" 
          sx={{ mb: 2 }} 
          onClose={() => setNotification(null)}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={() => {
                handleIntegrationToggle(notification.service);
                setNotification(null);
              }}
            >
              Reconnect
            </Button>
          }
        >
          {notification.message}
        </Alert>
      )}

      <Grid container spacing={3}>
        {integrations.map((integration) => (
          <Grid item xs={12} sm={6} md={4} key={integration.id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">
                    {integration.name}
                  </Typography>
                  <Box>
                    <Switch
                      checked={integration.connected}
                      onChange={() => handleIntegrationToggle(integration.id)}
                      color="primary"
                    />
                    {integration.connected && (
                      <>
                        <Tooltip title="Sync">
                          <IconButton 
                            onClick={() => handleRefresh(integration.id)}
                            disabled={refreshing}
                          >
                            <Refresh />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Settings">
                          <IconButton onClick={() => handleIntegrationToggle(integration.id)}>
                            <Settings />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </Box>
                </Box>
                
                <Typography variant="body2" color="text.secondary">
                  Status: {integration.connected ? 'Connected' : 'Not Connected'}
                </Typography>
                
                {integration.connected && integration.lastSync && (
                  <Typography variant="body2" color="text.secondary">
                    Last synced: {new Date(integration.lastSync).toLocaleString()}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <JiraIntegrationDialog 
        open={jiraDialogOpen}
        onClose={() => setJiraDialogOpen(false)}
        onConnect={handleJiraConnect}
      />
      <GitHubIntegrationDialog
        open={githubDialogOpen}
        onClose={() => setGithubDialogOpen(false)}
        onConnect={handleGitHubConnect}
      />
      <BitBucketIntegrationDialog
        open={bitbucketDialogOpen}
        onClose={() => setBitbucketDialogOpen(false)}
        onConnect={handleBitBucketConnect}
      />
      <TrelloIntegrationDialog
        open={trelloDialogOpen}
        onClose={() => setTrelloDialogOpen(false)}
        onConnect={handleTrelloConnect}
      />
    </div>
  );
};

export default Integrations;