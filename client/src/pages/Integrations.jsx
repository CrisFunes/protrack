import React from 'react';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';

const Integrations = () => {
  const integrations = [
    { id: 1, name: 'Jira', connected: true },
    { id: 2, name: 'Slack', connected: true },
    { id: 3, name: 'Bitbucket', connected: true },
    { id: 4, name: 'GitHub', connected: false },
    { id: 5, name: 'Trello', connected: false },
  ];

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Integrations
      </Typography>
      <Grid container spacing={3}>
        {integrations.map((integration) => (
          <Grid item xs={12} sm={6} md={4} key={integration.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {integration.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Status: {integration.connected ? 'Connected' : 'Not Connected'}
                </Typography>
                <Switch
                  checked={integration.connected}
                  color="primary"
                />
                <Button 
                  variant="outlined" 
                  color="primary" 
                  sx={{ ml: 2 }}
                >
                  {integration.connected ? 'Configure' : 'Connect'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default Integrations;