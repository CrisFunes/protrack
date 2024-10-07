import React, { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';  // Para mostrar un spinner de carga

const Projects = () => {
  const [projects, setProjects] = useState([]);        // Estado para los proyectos
  const [loading, setLoading] = useState(true);        // Estado para mostrar el spinner de carga
  const [error, setError] = useState(null);            // Estado para manejar errores

  // useEffect para hacer la petición a la API cuando el componente se monta
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('https://3000-idx-protrack-1726518802694.cluster-m7tpz3bmgjgoqrktlvd4ykrc2m.cloudworkstations.dev/api/jira/projects', {
          credentials: 'include', // Esto envía cookies con la solicitud
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
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
  
  // Mostrar un mensaje de error si la API falla
  if (error) {
    return <Typography variant="h6" color="error">{error}</Typography>;
  }

  // Mostrar un spinner de carga mientras se están obteniendo los datos
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
                <Typography variant="h6">{project.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Status: {project.status}
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