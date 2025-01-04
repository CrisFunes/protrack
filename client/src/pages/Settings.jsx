import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

const Settings = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    jobTitle: ''
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    darkMode: false
  });

  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch user data');
      }

      const data = await response.json();
      
      setProfile({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        jobTitle: data.jobTitle || ''
      });
      
      setPreferences(data.preferences || {
        emailNotifications: true,
        darkMode: false
      });
      
      setError(null);
    } catch (error) {
      console.error('Error in fetchUserData:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Update Profile
      const profileResponse = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profile)
      });

      if (!profileResponse.ok) {
        const errorData = await profileResponse.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      // Update Preferences
      const preferencesResponse = await fetch('/api/auth/preferences', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(preferences)
      });

      if (!preferencesResponse.ok) {
        const errorData = await preferencesResponse.json();
        throw new Error(errorData.message || 'Failed to update preferences');
      }

      setIsEditing(false);
      showNotification('Settings updated successfully', 'success');
    } catch (error) {
      console.error('Error saving settings:', error);
      showNotification(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/auth/profile', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete account');
      }

      // Limpiar el token y redirigir al login
      localStorage.removeItem('token');
      navigate('/login');
    } catch (error) {
      console.error('Error deleting account:', error);
      showNotification(error.message, 'error');
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  if (loading && !profile.firstName) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        <CircularProgress />
      </div>
    );
  }

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <Typography variant="h6">User Profile</Typography>
                {!isEditing ? (
                  <IconButton onClick={() => setIsEditing(true)} color="primary">
                    <EditIcon />
                  </IconButton>
                ) : (
                  <div>
                    <IconButton onClick={handleSave} color="primary" disabled={loading}>
                      <SaveIcon />
                    </IconButton>
                    <IconButton onClick={() => setIsEditing(false)} color="error" disabled={loading}>
                      <CancelIcon />
                    </IconButton>
                  </div>
                )}
              </div>
              
              {!isEditing ? (
                <div>
                  <Typography><strong>Name:</strong> {`${profile.firstName} ${profile.lastName}`}</Typography>
                  <Typography><strong>Email:</strong> {profile.email}</Typography>
                  <Typography><strong>Job Title:</strong> {profile.jobTitle || 'Not set'}</Typography>
                </div>
              ) : (
                <>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="firstName"
                    value={profile.firstName}
                    onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                    variant="outlined"
                    margin="normal"
                    disabled={loading}
                  />
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="lastName"
                    value={profile.lastName}
                    onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                    variant="outlined"
                    margin="normal"
                    disabled={loading}
                  />
                  <TextField
                    fullWidth
                    label="Job Title"
                    name="jobTitle"
                    value={profile.jobTitle}
                    onChange={(e) => setProfile({ ...profile, jobTitle: e.target.value })}
                    variant="outlined"
                    margin="normal"
                    disabled={loading}
                  />
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Preferences
              </Typography>
              <FormControlLabel
                control={
                  <Switch 
                    checked={preferences.emailNotifications}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      emailNotifications: e.target.checked
                    })}
                    color="primary"
                    disabled={loading}
                  />
                }
                label="Email Notifications"
              />
              <FormControlLabel
                control={
                  <Switch 
                    checked={preferences.darkMode}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      darkMode: e.target.checked
                    })}
                    color="primary"
                    disabled={true}
                  />
                }
                label="Dark Mode (Coming Soon)"
              />
              <Button 
                variant="contained" 
                color="primary" 
                sx={{ mt: 2 }}
                onClick={handleSave}
                disabled={loading}
                fullWidth
              >
                {loading ? <CircularProgress size={24} /> : 'Save Preferences'}
              </Button>
            </CardContent>
          </Card>

          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="error">
                Danger Zone
              </Typography>
              <Button 
                variant="outlined" 
                color="error" 
                fullWidth
                onClick={() => setDeleteDialogOpen(true)}
                disabled={loading}
              >
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Delete Account Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete your account? This action cannot be undone and you will lose all your data.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleDeleteAccount} color="error" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Delete Account'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert 
          onClose={() => setNotification({ ...notification, open: false })} 
          severity={notification.severity}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Settings;