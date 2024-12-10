import React, { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress'; // Spinner de carga
import Avatar from '@mui/material/Avatar'; // Componente para mostrar avatar

const Projects = () => {
  const [projects, setProjects] = useState([]); // Estado para los proyectos
  const [loading, setLoading] = useState(true); // Estado de carga
  const [error, setError] = useState(null); // Estado de errores

  // useEffect para hacer la petición a la API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(
          'https://3000-idx-protrack-1726518802694.cluster-m7tpz3bmgjgoqrktlvd4ykrc2m.cloudworkstations.dev/api/jira/projects',
          {
            credentials: 'include', // Incluir cookies
          }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Jira API Response:', data); // Log para analizar datos
        setProjects(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching projects:', error);
        setError(`Error fetching projects: ${error.message}`);
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Manejo de errores
  if (error) {
    return (
      <Typography variant="h6" color="error">
        {error}
      </Typography>
    );
  }

  // Mostrar spinner mientras se cargan los datos
  if (loading) {
    return <CircularProgress />;
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
                  {/* Mostrar el avatar del proyecto */}
                  <Grid item>
                    <Avatar
                      alt={project.name}
                      src={project.avatarUrls['48x48']}
                      sx={{ width: 48, height: 48 }}
                    />
                  </Grid>
                  <Grid item>
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
