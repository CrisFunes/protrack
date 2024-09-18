import React from 'react';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Button from '@mui/material/Button';

const Settings = () => {
  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                User Profile
              </Typography>
              <TextField
                fullWidth
                label="Full Name"
                variant="outlined"
                margin="normal"
              />
              <TextField
                fullWidth
                label="Email"
                variant="outlined"
                margin="normal"
              />
              <TextField
                fullWidth
                label="Job Title"
                variant="outlined"
                margin="normal"
              />
              <Button variant="contained" color="primary" sx={{ mt: 2 }}>
                Update Profile
              </Button>
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
                control={<Switch color="primary" />}
                label="Email Notifications"
              />
              <FormControlLabel
                control={<Switch color="primary" />}
                label="Dark Mode"
              />
              <FormControlLabel
                control={<Switch color="primary" />}
                label="Two-Factor Authentication"
              />
              <Button variant="contained" color="primary" sx={{ mt: 2 }}>
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default Settings;