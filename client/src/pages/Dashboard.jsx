import React, { useState, useEffect } from 'react';
import { Link as RouterLink, Navigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  Paper,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  School,
  Assessment,
  Person,
  Logout,
  LockOutlined,
  LockOpen,
  AccessTime,
  CheckCircle,
  Error as ErrorIcon,
  CalendarMonth
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { getAssignedExams } from '../services/studentService';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Redirect students to the student dashboard
  if (user && user.role === 'student') {
    return <Navigate to="/student/dashboard" />;
  }

  // Fetch assigned exams
  useEffect(() => {
    const fetchExams = async () => {
      try {
        if (user && user.role === 'student') {
          const data = await getAssignedExams();
          setExams(data);
        }
      } catch (err) {
        console.error('Error fetching exams:', err);
        setError('Failed to load your exams. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, [user]);

  const handleLogout = () => {
    logout();
  };

  // Get status chip for exam
  const getStatusChip = (exam) => {
    if (exam.availability === 'locked') {
      return (
        <Chip
          icon={<LockOutlined />}
          label="Locked"
          size="small"
          color="default"
          sx={{ fontWeight: 'medium' }}
        />
      );
    }

    if (exam.availability === 'upcoming') {
      return (
        <Chip
          icon={<CalendarMonth />}
          label="Upcoming"
          size="small"
          color="info"
          sx={{ fontWeight: 'medium' }}
        />
      );
    }

    if (exam.availability === 'available') {
      return (
        <Chip
          icon={<LockOpen />}
          label="Available"
          size="small"
          color="success"
          sx={{ fontWeight: 'medium' }}
        />
      );
    }

    if (exam.availability === 'expired') {
      return (
        <Chip
          icon={<AccessTime />}
          label="Expired"
          size="small"
          color="error"
          sx={{ fontWeight: 'medium' }}
        />
      );
    }

    return (
      <Chip
        icon={<ErrorIcon />}
        label="Unknown"
        size="small"
        color="default"
        sx={{ fontWeight: 'medium' }}
      />
    );
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Sidebar */}
      <Box
        sx={{
          width: 240,
          flexShrink: 0,
          bgcolor: 'primary.main',
          color: 'white',
          boxShadow: 4,
          display: { xs: 'none', md: 'block' }
        }}
      >
        <Box sx={{ p: 3, display: 'flex', alignItems: 'center' }}>
          <Avatar
            sx={{
              bgcolor: 'secondary.main',
              mr: 2,
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            }}
          >
            <School />
          </Avatar>
          <Typography variant="h6" fontWeight="bold">
            Testify
          </Typography>
        </Box>

        <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)' }} />

        <Box sx={{ p: 2 }}>
          <Button
            fullWidth
            startIcon={<DashboardIcon />}
            sx={{
              justifyContent: 'flex-start',
              color: 'white',
              py: 1.5,
              mb: 1,
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)' }
            }}
          >
            Dashboard
          </Button>

          <Button
            fullWidth
            startIcon={<Assessment />}
            sx={{
              justifyContent: 'flex-start',
              color: 'white',
              py: 1.5,
              mb: 1,
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
            }}
          >
            Exams
          </Button>

          <Button
            fullWidth
            startIcon={<Person />}
            sx={{
              justifyContent: 'flex-start',
              color: 'white',
              py: 1.5,
              mb: 1,
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
            }}
          >
            Profile
          </Button>

          <Box sx={{ mt: 4 }}>
            <Button
              fullWidth
              startIcon={<Logout />}
              onClick={handleLogout}
              sx={{
                justifyContent: 'flex-start',
                color: 'white',
                py: 1.5,
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
              }}
            >
              Logout
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Main content */}
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Container maxWidth="lg">
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Welcome, {user?.firstName || user?.email || 'User'}!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              This is your Testify dashboard. Here you can manage your exams and view your results.
            </Typography>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  height: '100%',
                  minHeight: 200
                }}
              >
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Your Assigned Exams
                </Typography>
                <Divider sx={{ mb: 2 }} />

                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : error ? (
                  <Alert severity="error" sx={{ my: 2 }}>
                    {error}
                  </Alert>
                ) : exams.length === 0 ? (
                  <Box sx={{ textAlign: 'center', my: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      You don't have any assigned exams yet.
                    </Typography>
                  </Box>
                ) : (
                  <List>
                    {exams.map((exam) => (
                      <ListItem
                        key={exam._id}
                        divider
                        sx={{
                          borderRadius: 1,
                          mb: 1,
                          '&:hover': {
                            bgcolor: 'rgba(0, 0, 0, 0.02)'
                          }
                        }}
                      >
                        <ListItemIcon>
                          <Assessment color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle1" fontWeight="medium">
                              {exam.title}
                            </Typography>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                {exam.description}
                              </Typography>
                              {exam.scheduledFor && (
                                <Typography variant="caption" color="text.secondary" display="block">
                                  Scheduled for: {new Date(exam.scheduledFor).toLocaleDateString()} at{' '}
                                  {exam.startTime ? new Date(exam.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD'}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                        <Box sx={{ ml: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                          {getStatusChip(exam)}
                          <Button
                            variant="outlined"
                            size="small"
                            color="primary"
                            component={RouterLink}
                            to={`/exams/${exam._id}`}
                            disabled={exam.availability === 'locked' || exam.availability === 'expired'}
                            sx={{ minWidth: '100px' }}
                          >
                            {exam.status === 'completed' ? 'View Result' : 'Take Exam'}
                          </Button>
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                )}
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  bgcolor: 'primary.lighter',
                  height: '100%',
                  minHeight: 200
                }}
              >
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Quick Links
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="primary"
                    component={RouterLink}
                    to="/exams"
                    startIcon={<Assessment />}
                    sx={{ mb: 2, justifyContent: 'flex-start', py: 1 }}
                  >
                    View All Exams
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="primary"
                    component={RouterLink}
                    to="/results"
                    startIcon={<CheckCircle />}
                    sx={{ mb: 2, justifyContent: 'flex-start', py: 1 }}
                  >
                    View Results
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="primary"
                    component={RouterLink}
                    to="/profile"
                    startIcon={<Person />}
                    sx={{ mb: 2, justifyContent: 'flex-start', py: 1 }}
                  >
                    Edit Profile
                  </Button>
                  {user && user.role === 'admin' && (
                    <Button
                      fullWidth
                      variant="contained"
                      color="secondary"
                      component={RouterLink}
                      to="/admin"
                      startIcon={<DashboardIcon />}
                      sx={{
                        justifyContent: 'flex-start',
                        py: 1,
                        fontWeight: 'bold',
                        color: 'black',
                        mb: 2
                      }}
                    >
                      Admin Dashboard
                    </Button>
                  )}

                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    component={RouterLink}
                    to="/student/dashboard"
                    startIcon={<School />}
                    sx={{
                      justifyContent: 'flex-start',
                      py: 1,
                      fontWeight: 'bold'
                    }}
                  >
                    Student Dashboard
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Dashboard;
