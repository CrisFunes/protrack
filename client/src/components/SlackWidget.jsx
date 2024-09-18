import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

const SlackWidget = () => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" component="div">
          Slack Activity
        </Typography>
        <Typography variant="body2" color="text.secondary">
          New Messages: 25
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Active Channels: 5
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Team Members Online: 8
        </Typography>
      </CardContent>
    </Card>
  );
};

export default SlackWidget;