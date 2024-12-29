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
import { Chip, Divider } from '@mui/material';
import TrelloIcon from '@mui/icons-material/ViewKanban';
import JiraIcon from './JiraIcon';

const Projects = () => {
  const [projects, setProjects] = useState({
    jira: [],
    trello: []
  });
  const [loading, setLoading] = useState({
    jira: true,
    trello: true
  });
  const [error, setError] = useState({
    jira: null,
    trello: null
  });

  useEffect(() => {
    fetchAllProjects();
  }, []);

  const fetchAllProjects = async () => {
    await Promise.all([
      fetchJiraProjects(),
      fetchTrelloBoards()
    ]);
  };

  const fetchJiraProjects = async () => {
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
        setLoading(prev => ({ ...prev, jira: false }));
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setProjects(prev => ({ ...prev, jira: data }));
    } catch (error) {
      console.error('Error fetching Jira projects:', error);
      setError(prev => ({ ...prev, jira: error.message }));
    } finally {
      setLoading(prev => ({ ...prev, jira: false }));
    }
  };

  const fetchTrelloBoards = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/integrations/trello/boards', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 404) {
        setLoading(prev => ({ ...prev, trello: false }));
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setProjects(prev => ({ ...prev, trello: data }));
    } catch (error) {
      console.error('Error fetching Trello boards:', error);
      setError(prev => ({ ...prev, trello: error.message }));
    } finally {
      setLoading(prev => ({ ...prev, trello: false }));
    }
  };

  const renderProjectSection = (title, items, isLoading, error, service, icon) => {
    if (isLoading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
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

    if (!items.length) {
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
                Connect {service}
              </Button>
            }
          >
            No {service} projects found
          </Alert>
        </Box>
      );
    }

    return (
      <>
        <Typography variant="h5" gutterBottom sx={{ mt: 4, display: 'flex', alignItems: 'center', gap: 1 }}>
          {icon}
          {title}
        </Typography>
        <Grid container spacing={3}>
          {items.map((project) => (
            <Grid item xs={12} sm={6} md={4} key={project.id}>
              <Card>
                <CardContent>
                  <Grid container alignItems="center" spacing={2}>
                    <Grid item>
                      {project.source === 'trello' ? (
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <TrelloIcon />
                        </Avatar>
                      ) : (
                        <Avatar
                          alt={project.name}
                          src={project.avatarUrls?.['48x48']}
                          sx={{ width: 48, height: 48 }}
                        />
                      )}
                    </Grid>
                    <Grid item xs>
                      <Typography variant="h6">{project.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Key: {project.key}
                      </Typography>
                    </Grid>
                  </Grid>
                  {project.description && (
                    <Typography variant="body2" color="text.secondary" mt={2}>
                      {project.description}
                    </Typography>
                  )}
                  <Box mt={2}>
                    <Chip 
                      label={project.private ? 'Private' : 'Public'} 
                      size="small" 
                      color={project.private ? 'default' : 'primary'} 
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </>
    );
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Projects
      </Typography>
      
      {renderProjectSection(
        'Jira Projects', 
        projects.jira, 
        loading.jira, 
        error.jira, 
        'Jira',
        <JiraIcon width={32} height={32} />
      )}
      
      {projects.jira.length > 0 && projects.trello.length > 0 && (
        <Divider sx={{ my: 4 }} />
      )}
      
      {renderProjectSection(
        'Trello Boards', 
        projects.trello, 
        loading.trello, 
        error.trello, 
        'Trello',
        <TrelloIcon />
      )}
    </div>
  );
};

export default Projects;