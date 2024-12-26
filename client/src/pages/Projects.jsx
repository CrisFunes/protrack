import React, { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Avatar from '@mui/material/Avatar';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasJiraIntegration, setHasJiraIntegration] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch('/api/integrations/jira/projects', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.status === 404) {
          setHasJiraIntegration(false);
          setLoading(false);
          return;
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Jira API Response:', data);
        setProjects(data);
        setHasJiraIntegration(true);
      } catch (error) {
        console.error('Error fetching projects:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (!hasJiraIntegration) {
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
              Connect Jira
            </Button>
          }
        >
          Please connect your Jira account to view projects
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
        Projects
      </Typography>
      <Grid container spacing={3}>
        {projects.map((project) => (
          <Grid item xs={12} sm={6} md={4} key={project.id}>
            <Card>
              <CardContent>
                <Grid container alignItems="center" spacing={2}>
                  <Grid item>
                    <Avatar
                      alt={project.name}
                      src={project.avatarUrls['48x48']}
                      sx={{ width: 48, height: 48 }}
                    />
                  </Grid>
                  <Grid item xs>
                    <Typography variant="h6">{project.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Key: {project.key}
                    </Typography>
                  </Grid>
                </Grid>
                <Typography variant="body2" color="text.secondary" mt={2}>
                  Type: {project.projectTypeKey}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Private: {project.isPrivate ? 'Yes' : 'No'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default Projects;