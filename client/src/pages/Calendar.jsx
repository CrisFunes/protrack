import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Box,
  Chip,
  IconButton,
  List,
  ListItem,
  Badge,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import dayjs from 'dayjs';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import GitHubIcon from '@mui/icons-material/GitHub';
import TrelloIcon from '@mui/icons-material/ViewKanban';
import JiraIcon from './JiraIcon';
import BitbucketIcon from './BitbucketIcon';

// Componente personalizado para los días del calendario
function ServerDay(props) {
  const { highlightedDays = [], day, outsideCurrentMonth, ...other } = props;

  const isHighlighted = !props.outsideCurrentMonth && 
    highlightedDays.some(date => 
      dayjs(date).format('YYYY-MM-DD') === day.format('YYYY-MM-DD')
    );

  return (
    <Badge
      key={props.day.toString()}
      overlap="circular"
      badgeContent={isHighlighted ? '🔵' : undefined}
    >
      <PickersDay 
        {...other} 
        outsideCurrentMonth={outsideCurrentMonth} 
        day={day}
        sx={{
          bgcolor: isHighlighted ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
          '&:hover': {
            bgcolor: isHighlighted ? 'rgba(25, 118, 210, 0.2)' : 'rgba(0, 0, 0, 0.04)',
          },
        }}
      />
    </Badge>
  );
}

const EventListItem = ({ event }) => {
  const getStatusColor = (status) => {
    status = status?.toLowerCase() || '';
    if (status.includes('done') || status.includes('complete')) return 'success';
    if (status.includes('progress')) return 'warning';
    if (status.includes('block') || status.includes('failed')) return 'error';
    return 'info';
  };

  const getPriorityColor = (priority) => {
    priority = priority?.toLowerCase() || '';
    if (priority.includes('high') || priority.includes('urgent')) return 'error';
    if (priority.includes('medium')) return 'warning';
    if (priority.includes('low')) return 'success';
    return 'default';
  };

  const getSourceIcon = (source) => {
    switch (source) {
      case 'jira':
        return <JiraIcon width={20} height={20} />;
      case 'trello':
        return <TrelloIcon />;
      case 'github':
        return <GitHubIcon />;
      case 'bitbucket':
        return <BitbucketIcon width={20} height={20} />;
      default:
        return null;
    }
  };

  return (
    <ListItem
      secondaryAction={
        event.url && (
          <IconButton 
            edge="end" 
            href={event.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <OpenInNewIcon />
          </IconButton>
        )
      }
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, width: '100%' }}>
        {getSourceIcon(event.source)}
        <Box sx={{ flex: 1 }}>
          <Box sx={{ mb: 0.5 }}>
            <Typography variant="subtitle1" component="div">
              {event.title}
            </Typography>
          </Box>
          <Box sx={{ mb: 0.5 }}>
            <Typography variant="body2" color="text.secondary" component="div">
              {event.project}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip
              size="small"
              label={event.status}
              color={getStatusColor(event.status)}
            />
            <Chip
              size="small"
              label={event.priority}
              color={getPriorityColor(event.priority)}
            />
          </Box>
        </Box>
      </Box>
    </ListItem>
  );
};

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedDateEvents, setSelectedDateEvents] = useState([]);

  useEffect(() => {
    fetchAllEvents();
  }, []);

  useEffect(() => {
    const dateStr = selectedDate.format('YYYY-MM-DD');
    const filteredEvents = events.filter(event => 
      dayjs(event.date).format('YYYY-MM-DD') === dateStr
    );
    setSelectedDateEvents(filteredEvents);
  }, [selectedDate, events]);

  const fetchAllEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      // Función auxiliar para hacer fetches
      const fetchEvents = async (service) => {
        try {
          const response = await fetch(`/api/integrations/${service}/calendar-events`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.status === 404) return [];
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

          const data = await response.json();
          return data;
        } catch (error) {
          console.error(`Error fetching ${service} events:`, error);
          return [];
        }
      };

      // Hacer todas las peticiones en paralelo
      const [jiraEvents, trelloEvents, githubEvents, bitbucketEvents] = await Promise.all([
        fetchEvents('jira'),
        fetchEvents('trello'),
        fetchEvents('github'),
        fetchEvents('bitbucket')
      ]);

      // Combinar todos los eventos
      setEvents([
        ...jiraEvents,
        ...trelloEvents,
        ...githubEvents,
        ...bitbucketEvents
      ]);
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getHighlightedDays = () => {
    return events.map(event => event.date);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Calendar
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error loading events: {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateCalendar
                value={selectedDate}
                onChange={(newValue) => setSelectedDate(newValue)}
                slots={{
                  day: ServerDay
                }}
                slotProps={{
                  day: {
                    highlightedDays: getHighlightedDays()
                  }
                }}
                sx={{
                  width: '100%',
                  '& .MuiDayCalendar-header': {
                    justifyContent: 'space-around',
                    width: '100%'
                  },
                  '& .MuiDayCalendar-weekContainer': {
                    justifyContent: 'space-around',
                    width: '100%'
                  },
                  '& .MuiPickersDay-root': {
                    fontSize: '0.875rem',
                    margin: '2px',
                    transition: 'background-color 0.2s ease-in-out'
                  },
                  '& .MuiDayCalendar-weekDayLabel': {
                    width: '36px', // Ajusta este valor según necesites
                    margin: '0 2px'  // Para mantener consistencia con los días
                  }
                }}
              />
              </LocalizationProvider>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom component="div">
                Events for {selectedDate.format('MMMM D, YYYY')}
              </Typography>
              
              {selectedDateEvents.length === 0 ? (
                <Alert severity="info">No events for this date</Alert>
              ) : (
                <List disablePadding>
                  {selectedDateEvents.map((event) => (
                    <EventListItem key={event.id} event={event} />
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default Calendar;