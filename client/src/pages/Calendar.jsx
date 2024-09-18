import React from 'react';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';

const Calendar = () => {
  const events = [
    { id: 1, title: 'Team Meeting', date: '2024-09-18', time: '10:00 AM' },
    { id: 2, title: 'Project Deadline', date: '2024-09-20', time: '5:00 PM' },
    { id: 3, title: 'Client Presentation', date: '2024-09-22', time: '2:00 PM' },
    { id: 4, title: 'Code Review', date: '2024-09-23', time: '11:00 AM' },
  ];

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Calendar
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Upcoming Events
              </Typography>
              <List>
                {events.map((event) => (
                  <ListItem key={event.id}>
                    <ListItemText 
                      primary={event.title}
                      secondary={`${event.date} at ${event.time}`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Add Event
              </Typography>
              {/* Add a form here for quick event addition */}
              <Typography variant="body2" color="text.secondary">
                Form for adding events will be implemented here.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default Calendar;