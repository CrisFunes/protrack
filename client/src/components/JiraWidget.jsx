import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

const JiraWidget = () => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" component="div">
          Jira Overview
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Open Issues: 10
        </Typography>
        <Typography variant="body2" color="text.secondary">
          In Progress: 5
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Completed: 15
        </Typography>
      </CardContent>
    </Card>
  );
};

export default JiraWidget;