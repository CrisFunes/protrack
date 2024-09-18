import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

const BitbucketWidget = () => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" component="div">
          Recent Commits
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Total Commits Today: 15
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Open Pull Requests: 3
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Latest Commit: "Update README.md"
        </Typography>
      </CardContent>
    </Card>
  );
};

export default BitbucketWidget;