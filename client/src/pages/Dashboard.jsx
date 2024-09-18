import React from 'react';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

const Item = styled(Paper)(({ theme }) => ({
  ...theme.typography.body2,
  padding: theme.spacing(2),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

function Dashboard() {
  return (
    <div>
      <Typography variant="h4" gutterBottom component="div">
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <Item>
            <Typography variant="h6" component="div">
              Jira Overview
            </Typography>
            {/* Aquí irá el componente de resumen de Jira */}
          </Item>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Item>
            <Typography variant="h6" component="div">
              Slack Activity
            </Typography>
            {/* Aquí irá el componente de actividad de Slack */}
          </Item>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Item>
            <Typography variant="h6" component="div">
              Recent Commits
            </Typography>
            {/* Aquí irá el componente de commits recientes de Bitbucket */}
          </Item>
        </Grid>
      </Grid>
    </div>
  );
}

export default Dashboard;