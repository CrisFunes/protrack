import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import StarIcon from '@mui/icons-material/Star';
import GitBranchIcon from '@mui/icons-material/AccountTree';
import { Chip, Divider } from '@mui/material';

const Repositories = () => {
    const navigate = useNavigate();
    const [repositories, setRepositories] = useState({
        github: [],
        bitbucket: []
    });
    const [loading, setLoading] = useState({
        github: true,
        bitbucket: true
    });
    const [error, setError] = useState({
        github: null,
        bitbucket: null
    });

    const handleTokenError = (service, errorData) => {
        // Redirigir a integraciones con mensaje de reconexión
        navigate('/integrations', {
            state: {
                reconnectService: service.toLowerCase(),
                message: errorData.message || `Your ${service} connection needs to be renewed. Please reconnect.`
            }
        });
    };

    const fetchServiceRepositories = async (service) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`/api/integrations/${service.toLowerCase()}/repositories`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 404) {
                    setRepositories(prev => ({ ...prev, [service.toLowerCase()]: [] }));
                } else if (response.status === 401 && data.code === 'TOKEN_REVOKED') {
                    handleTokenError(service, data);
                } else {
                    throw new Error(data.message || `Failed to fetch ${service} repositories`);
                }
            } else {
                setRepositories(prev => ({ ...prev, [service.toLowerCase()]: data }));
            }
        } catch (error) {
            console.error(`Error fetching ${service} repositories:`, error);
            setError(prev => ({
                ...prev,
                [service.toLowerCase()]: {
                    message: error.message,
                    requiresReconnection: error.message?.includes('token') || 
                                       error.message?.includes('revoked') ||
                                       error.message?.includes('authentication'),
                    retryAfter: error.retryAfter
                }
            }));
        } finally {
            setLoading(prev => ({ ...prev, [service.toLowerCase()]: false }));
        }
    };

    useEffect(() => {
        const fetchAllRepositories = async () => {
            await fetchServiceRepositories('GitHub');
            await fetchServiceRepositories('Bitbucket');
        };

        fetchAllRepositories();
    }, []);

    const renderRepositorySection = (title, repos, isLoading, error, service) => {
        if (isLoading) {
            return (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                    <CircularProgress />
                </Box>
            );
        }

        if (error) {
            return (
                <Box p={3}>
                    <Alert
                        severity={error.requiresReconnection ? "warning" : "error"}
                        action={
                            <Button
                                color="inherit"
                                size="small"
                                component={Link}
                                to="/integrations"
                                state={error.requiresReconnection ? {
                                    reconnectService: service.toLowerCase(),
                                    message: error.message
                                } : undefined}
                            >
                                {error.requiresReconnection ? `Reconnect ${service}` : 'Go to Integrations'}
                            </Button>
                        }
                    >
                        {error.message || `Error loading ${service} repositories`}
                    </Alert>
                </Box>
            );
        }

        if (!repos.length) {
            return (
                <Box p={3}>
                    <Alert
                        severity="info"
                        action={
                            <Button
                                color="inherit"
                                size="small"
                                component={Link}
                                to="/integrations"
                            >
                                Connect {service}
                            </Button>
                        }
                    >
                        No {service} repositories found
                    </Alert>
                </Box>
            );
        }

        return (
            <>
                <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
                    {title} Repositories
                </Typography>
                <Grid container spacing={3}>
                    {repos.map((repo) => (
                        <Grid item xs={12} sm={6} md={4} key={repo.id}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" component="div">
                                        {repo.name}
                                    </Typography>
                                    {repo.description && (
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            {repo.description}
                                        </Typography>
                                    )}
                                    <Box display="flex" alignItems="center" gap={2} mb={1}>
                                        {repo.source !== 'bitbucket' && (
                                            <Box display="flex" alignItems="center">
                                                <StarIcon fontSize="small" sx={{ mr: 0.5 }} />
                                                <Typography variant="body2">{repo.stargazers_count}</Typography>
                                            </Box>
                                        )}
                                        <Box display="flex" alignItems="center">
                                            <GitBranchIcon fontSize="small" sx={{ mr: 0.5 }} />
                                            <Typography variant="body2">{repo.forks_count}</Typography>
                                        </Box>
                                        <Chip
                                            label={repo.private ? 'Private' : 'Public'}
                                            size="small"
                                            color={repo.private ? 'default' : 'primary'}
                                        />
                                    </Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Language: {repo.language}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Updated: {new Date(repo.updated_at).toLocaleDateString()}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </>
        );
    };

    return (
        <div>
            <Typography variant="h4" gutterBottom>
                Repositories
            </Typography>

            {renderRepositorySection('GitHub', repositories.github, loading.github, error.github, 'GitHub')}

            {repositories.github.length > 0 && repositories.bitbucket.length > 0 && (
                <Divider sx={{ my: 4 }} />
            )}

            {renderRepositorySection('Bitbucket', repositories.bitbucket, loading.bitbucket, error.bitbucket, 'Bitbucket')}
        </div>
    );
};

export default Repositories;