import React, { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';
import TrelloIcon from '@mui/icons-material/ViewKanban';
import JiraIcon from './JiraIcon';  // Asegúrate de tener este componente
import IconButton from '@mui/material/IconButton';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

const Tasks = () => {
  const [tasks, setTasks] = useState({
    jira: [],
    trello: []
  });
  const [loading, setLoading] = useState({
    jira: true,
    trello: true
  });
  const [error, setError] = useState({
    jira: null,
    trello: null
  });
  const [activeTab, setActiveTab] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
    fetchAllTasks();
  }, []);

  const fetchAllTasks = async () => {
    await Promise.all([
      fetchJiraTasks(),
      fetchTrelloCards()
    ]);
  };

  const fetchJiraTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch('/api/integrations/jira/tasks', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 404) {
        setLoading(prev => ({ ...prev, jira: false }));
        return;
      }

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      setTasks(prev => ({ ...prev, jira: data }));
    } catch (error) {
      console.error('Error fetching Jira tasks:', error);
      setError(prev => ({ ...prev, jira: error.message }));
    } finally {
      setLoading(prev => ({ ...prev, jira: false }));
    }
  };

  const fetchTrelloCards = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch('/api/integrations/trello/cards', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 404) {
        setLoading(prev => ({ ...prev, trello: false }));
        return;
      }

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      setTasks(prev => ({ ...prev, trello: data }));
    } catch (error) {
      console.error('Error fetching Trello cards:', error);
      setError(prev => ({ ...prev, trello: error.message }));
    } finally {
      setLoading(prev => ({ ...prev, trello: false }));
    }
  };

  const getStatusColor = (status) => {
    status = status.toLowerCase();
    if (status.includes('done') || status.includes('complete')) return 'success';
    if (status.includes('progress')) return 'warning';
    if (status.includes('block') || status.includes('fail')) return 'error';
    return 'default';
  };

  const getPriorityColor = (priority) => {
    priority = priority.toLowerCase();
    if (priority.includes('high')) return 'error';
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
      default:
        return null;
    }
  };

  const filterTasks = () => {
    let filteredTasks = [];
    
    if (activeTab === 'all' || activeTab === 'jira') {
      filteredTasks = [...filteredTasks, ...tasks.jira];
    }
    if (activeTab === 'all' || activeTab === 'trello') {
      filteredTasks = [...filteredTasks, ...tasks.trello];
    }

    return filteredTasks.filter(task => {
      const statusMatch = statusFilter === 'all' || 
        task.status.toLowerCase().includes(statusFilter.toLowerCase());
      const priorityMatch = priorityFilter === 'all' || 
        task.priority.toLowerCase().includes(priorityFilter.toLowerCase());
      return statusMatch && priorityMatch;
    });
  };

  if (loading.jira || loading.trello) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Tasks
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="All" value="all" />
          <Tab label="Jira" value="jira" />
          <Tab label="Trello" value="trello" />
        </Tabs>
      </Box>

      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="todo">To Do</MenuItem>
            <MenuItem value="progress">In Progress</MenuItem>
            <MenuItem value="done">Done</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Priority</InputLabel>
          <Select
            value={priorityFilter}
            label="Priority"
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="high">High</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="low">Low</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        {filterTasks().map((task) => (
          <Grid item xs={12} sm={6} md={4} key={task.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  {getSourceIcon(task.source)}
                  <Typography variant="h6" sx={{ flex: 1 }}>{task.title}</Typography>
                  {task.url && (
                    <IconButton 
                      size="small" 
                      href={task.url} 
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <OpenInNewIcon />
                    </IconButton>
                  )}
                </Box>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Project: {task.project}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <Chip 
                    label={task.status}
                    color={getStatusColor(task.status)}
                    size="small"
                  />
                  <Chip 
                    label={task.priority}
                    color={getPriorityColor(task.priority)}
                    size="small"
                  />
                </Box>

                {task.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {task.description.substring(0, 100)}
                    {task.description.length > 100 ? '...' : ''}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filterTasks().length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          No tasks found with the current filters.
        </Alert>
      )}
    </div>
  );
};

export default Tasks;