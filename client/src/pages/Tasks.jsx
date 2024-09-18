import React from 'react';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';

const Tasks = () => {
  const tasks = [
    { id: 1, title: 'Implement login functionality', status: 'In Progress', priority: 'High' },
    { id: 2, title: 'Design dashboard layout', status: 'Completed', priority: 'Medium' },
    { id: 3, title: 'Write unit tests', status: 'To Do', priority: 'Low' },
    { id: 4, title: 'Refactor API calls', status: 'In Progress', priority: 'Medium' },
  ];

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Tasks
      </Typography>
      <Grid container spacing={3}>
        {tasks.map((task) => (
          <Grid item xs={12} sm={6} md={4} key={task.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{task.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Status: {task.status}
                </Typography>
                <Chip 
                  label={task.priority} 
                  color={task.priority === 'High' ? 'error' : task.priority === 'Medium' ? 'warning' : 'success'} 
                  size="small" 
                  sx={{ mt: 1 }}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default Tasks;