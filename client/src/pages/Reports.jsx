import React from 'react';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';

const Reports = () => {
  const reportTypes = [
    { id: 1, title: 'Project Progress Report', description: 'Overview of all project statuses and milestones' },
    { id: 2, title: 'Team Performance Report', description: 'Analysis of team productivity and efficiency' },
    { id: 3, title: 'Resource Allocation Report', description: 'Breakdown of resource distribution across projects' },
    { id: 4, title: 'Financial Summary', description: 'Financial overview of all ongoing projects' },
  ];

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Reports
      </Typography>
      <Grid container spacing={3}>
        {reportTypes.map((report) => (
          <Grid item xs={12} sm={6} md={4} key={report.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {report.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {report.description}
                </Typography>
                <Button variant="contained" color="primary">
                  Generate Report
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default Reports;