import React, { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';
import StarIcon from '@mui/icons-material/Star';
import GitBranchIcon from '@mui/icons-material/AccountTree';
import { Chip } from '@mui/material';

const Repositories = () => {
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasGitHubIntegration, setHasGitHubIntegration] = useState(true);

  useEffect(() => {
    const fetchRepositories = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch('/api/integrations/github/repositories', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.status === 404) {
          setHasGitHubIntegration(false);
          setLoading(false);
          return;
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setRepositories(data);
        setHasGitHubIntegration(true);
      } catch (error) {
        console.error('Error fetching repositories:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRepositories();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (!hasGitHubIntegration) {
    return (
      <Box p={3}>
        <Alert 
          severity="info"
          action={
            <Button 
              color="inherit" 
              size="small" 
              component={Link} 
              to="/integrations"
            >
              Connect GitHub
            </Button>
          }
        >
          Please connect your GitHub account to view repositories
        </Alert>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        GitHub Repositories
      </Typography>
      <Grid container spacing={3}>
        {repositories.map((repo) => (
          <Grid item xs={12} sm={6} md={4} key={repo.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="div">
                  {repo.name}
                </Typography>
                {repo.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {repo.description}
                  </Typography>
                )}
                <Box display="flex" alignItems="center" gap={2} mb={1}>
                  <Box display="flex" alignItems="center">
                    <StarIcon fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography variant="body2">{repo.stargazers_count}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center">
                    <GitBranchIcon fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography variant="body2">{repo.forks_count}</Typography>
                  </Box>
                  <Chip 
                    label={repo.private ? 'Private' : 'Public'} 
                    size="small" 
                    color={repo.private ? 'default' : 'primary'} 
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Language: {repo.language || 'Not specified'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Updated: {new Date(repo.updated_at).toLocaleDateString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default Repositories;