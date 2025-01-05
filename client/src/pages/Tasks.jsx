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
import GitHubIcon from '@mui/icons-material/GitHub';
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
    trello: [],
    github: [],
    bitbucket: []
  });
  
  const [loading, setLoading] = useState({
    jira: true,
    trello: true,
    github: true,
    bitbucket: true
  });
  
  const [error, setError] = useState({
    jira: null,
    trello: null,
    github: null,
    bitbucket: null
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
      fetchTrelloCards(),
      fetchGitHubTasks(),
      fetchBitbucketTasks()
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

  const fetchGitHubTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch('/api/integrations/github/tasks', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 404) {
        setLoading(prev => ({ ...prev, github: false }));
        return;
      }

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      setTasks(prev => ({ ...prev, github: data }));
    } catch (error) {
      console.error('Error fetching GitHub tasks:', error);
      setError(prev => ({ ...prev, github: error.message }));
    } finally {
      setLoading(prev => ({ ...prev, github: false }));
    }
  };

  const fetchBitbucketTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch('/api/integrations/bitbucket/tasks', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 404) {
        setLoading(prev => ({ ...prev, bitbucket: false }));
        return;
      }

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      setTasks(prev => ({ ...prev, bitbucket: data }));
    } catch (error) {
      console.error('Error fetching Bitbucket tasks:', error);
      setError(prev => ({ ...prev, bitbucket: error.message }));
    } finally {
      setLoading(prev => ({ ...prev, bitbucket: false }));
    }
  };

  const normalizeStatus = (status, type) => {
    status = status.toLowerCase().trim();
    
    if (type === 'pull-request') {
      if (status === 'open' || status === 'draft') return 'todo';
      if (status === 'merged') return 'done';
      if (status === 'declined' || status === 'closed') return 'done';
    }
    
    // Para tareas "To Do"
    if (status.includes('to do') || 
        status.includes('todo') || 
        status.includes('backlog') || 
        status.includes('open') ||
        status.includes('por hacer') ||
        status.includes('pendiente') ||
        status.includes('nuevo') ||
        status.includes('nueva') ||
        status === 'new') {
      return 'todo';
    }
    
    // Para tareas "In Progress"
    if (status.includes('progress') || 
        status.includes('doing') || 
        status.includes('ongoing') ||
        status.includes('started') ||
        status.includes('en proceso') ||
        status.includes('en progreso') ||
        status.includes('en curso') ||
        status.includes('iniciado') ||
        status.includes('iniciada') ||
        status.includes('trabajando')) {
      return 'progress';
    }
    
    // Para tareas "Done"
    if (status.includes('done') || 
        status.includes('complete') || 
        status.includes('finished') ||
        status.includes('closed') ||
        status.includes('terminado') ||
        status.includes('terminada') ||
        status.includes('completado') ||
        status.includes('completada') ||
        status.includes('finalizado') ||
        status.includes('finalizada') ||
        status.includes('cerrado') ||
        status.includes('cerrada') ||
        status.includes('resuelto') ||
        status.includes('resuelta')) {
      return 'done';
    }
  
    return 'other';
  };
  
  // Función para normalizar prioridades
  const normalizePriority = (priority) => {
    priority = priority.toLowerCase().trim();
    
    if (priority.includes('high') || 
        priority.includes('urgent') || 
        priority.includes('highest') ||
        priority.includes('alta') ||
        priority.includes('alto') ||
        priority.includes('urgente') ||
        priority.includes('crítica') ||
        priority.includes('critica')) {
      return 'high';
    }
    
    if (priority.includes('medium') || 
        priority.includes('normal') || 
        priority.includes('default') ||
        priority.includes('media') ||
        priority.includes('medio') ||
        priority.includes('moderada') ||
        priority.includes('moderado')) {
      return 'medium';
    }
    
    if (priority.includes('low') || 
        priority.includes('lowest') || 
        priority.includes('minor') ||
        priority.includes('baja') ||
        priority.includes('bajo') ||
        priority.includes('mínima') ||
        priority.includes('minima')) {
      return 'low';
    }
  
    return 'medium'; // prioridad por defecto
  };

  const getStatusColor = (status) => {
    const normalizedStatus = normalizeStatus(status);
    switch (normalizedStatus) {
      case 'done':
        return 'success';
      case 'progress':
        return 'warning';
      case 'todo':
        return 'info';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    const normalizedPriority = normalizePriority(priority);
    switch (normalizedPriority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
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
        return <img src="/bitbucket-icon.png" alt="Bitbucket" width="20" height="20" />;
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
    if (activeTab === 'all' || activeTab === 'github') {
      filteredTasks = [...filteredTasks, ...tasks.github];
    }
    if (activeTab === 'all' || activeTab === 'bitbucket') {
      filteredTasks = [...filteredTasks, ...tasks.bitbucket];
    }

    return filteredTasks.filter(task => {
      const normalizedTaskStatus = normalizeStatus(task.status, task.type);
      const normalizedTaskPriority = normalizePriority(task.priority);
      
      const statusMatch = statusFilter === 'all' || 
                         normalizedTaskStatus === statusFilter;
      const priorityMatch = priorityFilter === 'all' || 
                           normalizedTaskPriority === priorityFilter;
      
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

      <Box sx={{ 
        mb: 3, 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: 1,
        borderColor: 'divider'
      }}>
        {/* Contenedor izquierdo para las pestañas */}
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ flex: 1 }}
        >
          <Tab label="All" value="all" />
          <Tab label="Jira" value="jira" />
          <Tab label="Trello" value="trello" />
          <Tab label="GitHub" value="github" />
          <Tab label="Bitbucket" value="bitbucket" />
        </Tabs>

        {/* Contenedor derecho para los filtros */}
        <Box sx={{ display: 'flex', gap: 2, py: 1 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
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

          <FormControl size="small" sx={{ minWidth: 120 }}>
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