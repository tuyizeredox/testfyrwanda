import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Avatar,
  Divider,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Snackbar,
  IconButton,
  InputAdornment,
  Grow,
  Fade
} from '@mui/material';
import {
  Person,
  Email,
  School,
  Edit,
  Save,
  Cancel,
  Visibility,
  VisibilityOff,
  Badge,
  Business,
  Class as ClassIcon
} from '@mui/icons-material';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import StudentLayout from './StudentLayout';

const Profile = () => {
  const { user, updateUserProfile } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    currentPassword: '',
    class: '',
    organization: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        password: '',
        currentPassword: '',
        class: user.class || '',
        organization: user.organization || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleToggleEditMode = () => {
    setEditMode(!editMode);
    if (editMode) {
      // Reset form data when canceling edit
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        password: '',
        currentPassword: '',
        class: user.class || '',
        organization: user.organization || ''
      });
    }
  };

  const handleToggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare data for API
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        class: formData.class,
        organization: formData.organization
      };

      // Only include password if it was changed
      if (formData.password) {
        updateData.password = formData.password;
        updateData.currentPassword = formData.currentPassword;
      }

      // Call API to update profile
      const response = await api.put('/profile', updateData);

      // Update local user data
      updateUserProfile(response.data);

      setSnackbar({
        open: true,
        message: 'Profile updated successfully',
        severity: 'success'
      });

      setEditMode(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to update profile',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <StudentLayout>
      <Container maxWidth="lg" sx={{ mb: 4 }}>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

        <Grow in={true} timeout={800}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              mb: 4,
              borderRadius: 0, // Remove rounded corners
              background: 'linear-gradient(135deg, #4a148c 0%, #7c43bd 100%)',
              color: 'white',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                Your Profile
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleToggleEditMode}
                startIcon={editMode ? <Cancel /> : <Edit />}
                sx={{ color: 'black', fontWeight: 'bold', borderRadius: 0 }}
              >
                {editMode ? 'Cancel' : 'Edit Profile'}
              </Button>
            </Box>
          </Paper>
        </Grow>

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Fade in={true} timeout={1000}>
              <Card elevation={3} sx={{ height: '100%', borderRadius: 0 }}>
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Avatar
                    sx={{
                      width: 120,
                      height: 120,
                      mx: 'auto',
                      mb: 2,
                      bgcolor: 'primary.main',
                      fontSize: '3rem',
                      boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)'
                    }}
                  >
                    {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'S'}
                  </Avatar>

                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    {user?.firstName} {user?.lastName}
                  </Typography>

                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    {user?.email}
                  </Typography>

                  <Chip
                    label="Student"
                    color="primary"
                    sx={{ mt: 1, borderRadius: 0 }}
                  />

                  <Divider sx={{ my: 3 }} />

                  <Box sx={{ textAlign: 'left' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <School sx={{ mr: 2, color: 'primary.main' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Class
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {user?.class || 'Not specified'}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Business sx={{ mr: 2, color: 'primary.main' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Organization
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {user?.organization || 'Not specified'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Fade>
          </Grid>

          <Grid item xs={12} md={8}>
            <Fade in={true} timeout={1200}>
              <Card elevation={3} sx={{ borderRadius: 0 }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    {editMode ? 'Edit Profile Information' : 'Profile Information'}
                  </Typography>

                  <Divider sx={{ mb: 3 }} />

                  <Box component="form" onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="First Name"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          disabled={!editMode}
                          required
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Person color="primary" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Last Name"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          disabled={!editMode}
                          required
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Person color="primary" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Email Address"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          disabled={true}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Email color="primary" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Class"
                          name="class"
                          value={formData.class}
                          onChange={handleChange}
                          disabled={!editMode}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <ClassIcon color="primary" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Organization"
                          name="organization"
                          value={formData.organization}
                          onChange={handleChange}
                          disabled={!editMode}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Business color="primary" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>

                      {editMode && (
                        <>
                          <Grid item xs={12}>
                            <Divider>
                              <Chip label="Change Password (Optional)" sx={{ borderRadius: 0 }} />
                            </Divider>
                          </Grid>

                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Current Password"
                              name="currentPassword"
                              type={showPassword ? 'text' : 'password'}
                              value={formData.currentPassword}
                              onChange={handleChange}
                              InputProps={{
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <IconButton
                                      onClick={handleToggleShowPassword}
                                      edge="end"
                                    >
                                      {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </Grid>

                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="New Password"
                              name="password"
                              type={showPassword ? 'text' : 'password'}
                              value={formData.password}
                              onChange={handleChange}
                              InputProps={{
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <IconButton
                                      onClick={handleToggleShowPassword}
                                      edge="end"
                                    >
                                      {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </Grid>
                        </>
                      )}
                    </Grid>

                    {editMode && (
                      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                          variant="outlined"
                          onClick={handleToggleEditMode}
                          sx={{ mr: 2, borderRadius: 0 }}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Save />}
                          disabled={loading}
                          sx={{ borderRadius: 0 }}
                        >
                          {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        </Grid>
      </Container>
    </StudentLayout>
  );
};

export default Profile;
