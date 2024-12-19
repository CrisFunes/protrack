import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Container,
  Link
} from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

const AuthForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const response = await axios({
        method: 'POST',
        url: `/api${endpoint}`,
        data: formData,
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box 
      className="min-h-screen bg-gray-50"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pt: 8, // Espacio superior para el logo
        pb: 8  // Espacio inferior
      }}
    >
      {/* Logo y nombre de la plataforma */}
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center',
          mb: 6 
        }}
      >
        <img 
          src="src/assets/logo.svg" 
          alt="ProTrack Logo" 
          style={{ height: '80px' }}
        />
        <Typography 
          variant="h3" 
          component="div" 
          sx={{ 
            ml: 2,
            fontWeight: 'bold',
          }}
        >
          ProTrack
        </Typography>
      </Box>

      <Container maxWidth="sm">
        <Card 
          elevation={4}
          sx={{ 
            borderRadius: 2,
            overflow: 'visible'
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              mb: 4
            }}>
              {isLogin ? (
                <LoginIcon sx={{ fontSize: 48 }} color="primary" />
              ) : (
                <PersonAddIcon sx={{ fontSize: 48 }} color="primary" />
              )}
              <Typography 
                variant="h4" 
                component="h1" 
                sx={{ 
                  mt: 2,
                  fontWeight: 500
                }}
              >
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {!isLogin && (
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                      fullWidth
                      label="First Name"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      variant="outlined"
                    />
                    <TextField
                      fullWidth
                      label="Last Name"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      variant="outlined"
                    />
                  </Box>
                )}

                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  variant="outlined"
                />

                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  variant="outlined"
                />

                <Button
                  type="submit"
                  disabled={loading}
                  variant="contained"
                  fullWidth
                  size="large"
                  sx={{ mt: 2 }}
                >
                  {loading ? (
                    <Box className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Loading...
                    </Box>
                  ) : (
                    isLogin ? 'Login' : 'Register'
                  )}
                </Button>
              </Box>
            </form>

            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Link
                component="button"
                variant="body2"
                onClick={() => setIsLogin(!isLogin)}
                sx={{
                  color: 'primary.main',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                {isLogin 
                  ? "Don't have an account? Register" 
                  : 'Already have an account? Login'}
              </Link>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default AuthForm;