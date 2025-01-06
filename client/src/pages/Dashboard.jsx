import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  IconButton,
  Chip,
  LinearProgress,
  Divider,
  Alert,
  AlertTitle,
  Button,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Link } from 'react-router-dom';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import TimelineIcon from '@mui/icons-material/Timeline';
import AssignmentIcon from '@mui/icons-material/Assignment';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import GitHubIcon from '@mui/icons-material/GitHub';
import TrelloIcon from '@mui/icons-material/ViewKanban';
import JiraIcon from '../assets/JiraIcon';
import BitbucketIcon from '../assets/BitbucketIcon';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  maxHeight: '500px',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
  '& .MuiCardContent-root': {
    padding: theme.spacing(2),
    height: '100%',
    overflow: 'auto',
    '&::-webkit-scrollbar': {
      width: '6px'
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: theme.palette.grey[300],
      borderRadius: '4px'
    }
  }
}));

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState({});
  const [stats, setStats] = useState({
    tasks: { 
      total: 0, 
      byStatus: [], 
      byPriority: [] 
    },
    commits: { 
      total: 0, 
      byAuthor: [], 
      recent: [] 
    },
    activities: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const fetchServiceStats = async (service) => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');

        const response = await fetch(`/api/integrations/${service}/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.status === 404) {
          return null;
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`${service} error: ${errorData.message || response.statusText}`);
        }

        const data = await response.json();
        return data;
      } catch (error) {
        setError(prev => ({
          ...prev,
          [service]: error.message
        }));
        return null;
      }
    };

    try {
      const [jiraStats, githubStats, trelloStats, bitbucketStats] = await Promise.allSettled([
        fetchServiceStats('jira'),
        fetchServiceStats('github'),
        fetchServiceStats('trello'),
        fetchServiceStats('bitbucket')
      ]);

      // Actualizar las estadísticas solo con los servicios que respondieron exitosamente
      setStats({
        tasks: {
          total: ((jiraStats.value?.tasks?.total || 0) + (trelloStats.value?.cards?.total || 0)),
          byStatus: jiraStats.value?.tasks?.byStatus || [],
          byPriority: jiraStats.value?.tasks?.byPriority || []
        },
        commits: {
          total: ((githubStats.value?.commits?.total || 0) + (bitbucketStats.value?.commits?.total || 0)),
          byAuthor: [...(githubStats.value?.commits?.byAuthor || [])],
          recent: [
            ...(githubStats.value?.commits?.recent || []).map(c => ({ ...c, source: 'github' })),
            ...(bitbucketStats.value?.commits?.recent || []).map(c => ({ ...c, source: 'bitbucket' }))
          ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)
        },
        activities: [
          ...(jiraStats.value?.recentActivities || []),
          ...(trelloStats.value?.recentActivities || [])
        ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)
      });
    } catch (error) {
      setError(prev => ({
        ...prev,
        general: error.message
      }));
    } finally {
      setLoading(false);
    }
  };

  const TaskStatusChart = () => (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={stats.tasks.byStatus}
          cx="50%"
          cy="50%"
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, value }) => `${name}: ${value}`}
        >
          {stats.tasks.byStatus.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <RechartsTooltip />
      </PieChart>
    </ResponsiveContainer>
  );

  const CommitChart = () => (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={stats.commits.byAuthor}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <RechartsTooltip />
        <Bar dataKey="commits" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );

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
        Dashboard
      </Typography>

      <Grid container spacing={2} sx={{ mb: 1 }}>
        {/* Resumen de Tareas */}
        <Grid item xs={12} md={4}>
          <StyledCard>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <AssignmentIcon color="primary" />
                  <Typography variant="h6">Task Summary</Typography>
                </Box>
                <Typography variant="subtitle2" color="textSecondary">
                  Total: {stats.tasks.total}
                </Typography>
              </Box>

              <TaskStatusChart />

              <Box mt={2}>
                <Typography variant="subtitle2" gutterBottom>
                  Priority Distribution
                </Typography>
                {stats.tasks.byPriority.map((priority, index) => (
                  <Box key={priority.name} mb={1}>
                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                      <Typography variant="body2">{priority.name}</Typography>
                      <Typography variant="body2">{priority.value}</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(priority.value / stats.tasks.total) * 100}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>

        {/* Actividad de Commits */}
        <Grid item xs={12} md={4}>
          <StyledCard>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box display="flex" alignItems="center" gap={1}>
                <TimelineIcon color="primary" sx={{ fontSize: '1.2rem' }} />
                  <Typography variant="h6" sx={{ fontSize: '1rem' }}> {/* texto más pequeño */}
                    Commit Activity
                  </Typography>
                </Box>
                <Typography variant="subtitle2" color="textSecondary">
                  Total: {stats.commits.total}
                </Typography>
              </Box>

              <CommitChart />

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" gutterBottom>
                Recent Commits
              </Typography>

              {stats.commits.recent.map((commit, index) => (
                <Box key={index} display="flex" alignItems="center" gap={1} mb={1}>
                  {getSourceIcon(commit.source)}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" noWrap title={commit.message}>
                      {commit.message}
                    </Typography>
                  </Box>
                  <Chip
                    label={new Date(commit.date).toLocaleDateString()}
                    size="small"
                    variant="outlined"
                  />
                </Box>
              ))}
            </CardContent>
          </StyledCard>
        </Grid>

        {/* Actividades Recientes */}
        <Grid item xs={12} md={4}>
          <StyledCard>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box display="flex" alignItems="center" gap={1}>
                  <FormatListBulletedIcon color="primary" />
                  <Typography variant="h6">Recent Activities</Typography>
                </Box>
              </Box>

              {stats.activities.map((activity, index) => (
                <Box key={index} mb={2}>
                  <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                    {getSourceIcon(activity.source)}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" noWrap title={activity.description}>
                        {activity.description}
                      </Typography>
                    </Box>
                    {activity.url && (
                      <IconButton 
                        size="small"
                        href={activity.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <OpenInNewIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Chip
                      label={activity.type}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    <Typography variant="caption" color="textSecondary">
                      {new Date(activity.date).toLocaleString()}
                    </Typography>
                  </Box>
                  {index < stats.activities.length - 1 && (
                    <Divider sx={{ mt: 2 }} />
                  )}
                </Box>
              ))}
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>
    </div>
  );
};

export default Dashboard;