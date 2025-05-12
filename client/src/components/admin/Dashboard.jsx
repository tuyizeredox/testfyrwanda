import React, { useState, useEffect, useContext } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Divider,
  Avatar,
  Chip,
  LinearProgress,
  Grow,
  Zoom,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  TextField
} from '@mui/material';
import {
  People,
  School,
  Assessment,
  LockOpen,
  Lock,
  Add,
  ArrowForward,
  Refresh,
  Edit,
  Delete,
  CheckCircle,
  Cancel,
  Warning
} from '@mui/icons-material';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalExams: 0,
    completedExams: 0,
    pendingGrading: 0
  });
  const [systemLocked, setSystemLocked] = useState(false);
  const [lockMessage, setLockMessage] = useState('');
  const [recentExams, setRecentExams] = useState([]);
  const [recentStudents, setRecentStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lockLoading, setLockLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch system lock status
      const lockRes = await api.get('/api/admin/system-lock');
      setSystemLocked(lockRes.data.isLocked);
      setLockMessage(lockRes.data.lockMessage);
      
      // Fetch students
      const studentsRes = await api.get('/api/admin/students');
      
      // Fetch exams
      const examsRes = await api.get('/api/exam');
      
      // Calculate stats
      const students = studentsRes.data;
      const exams = examsRes.data;
      
      const completedExams = exams.filter(exam => !exam.isLocked).length;
      
      // TODO: Replace with actual API call when implemented
      const pendingGrading = Math.floor(Math.random() * 10); // Placeholder
      
      setStats({
        totalStudents: students.length,
        totalExams: exams.length,
        completedExams,
        pendingGrading
      });
      
      // Get recent exams
      const sortedExams = [...exams].sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }).slice(0, 3);
      
      setRecentExams(sortedExams);
      
      // Get recent students
      const sortedStudents = [...students].sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }).slice(0, 5);
      
      setRecentStudents(sortedStudents);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
      setLoading(false);
    }
  };

  const handleSystemLockToggle = async () => {
    try {
      setLockLoading(true);
      
      await api.put('/api/admin/system-lock', {
        isLocked: !systemLocked,
        lockMessage
      });
      
      setSystemLocked(!systemLocked);
      setLockLoading(false);
    } catch (error) {
      console.error('Error toggling system lock:', error);
      setError('Failed to update system lock status. Please try again.');
      setLockLoading(false);
    }
  };

  const handleLockMessageChange = (e) => {
    setLockMessage(e.target.value);
  };

  const handleSaveLockMessage = async () => {
    try {
      setLockLoading(true);
      
      await api.put('/api/admin/system-lock', {
        isLocked: systemLocked,
        lockMessage
      });
      
      setLockLoading(false);
    } catch (error) {
      console.error('Error updating lock message:', error);
      setError('Failed to update lock message. Please try again.');
      setLockLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grow in={true} timeout={800}>
        <Grid container spacing={4}>
          {/* Welcome Card */}
          <Grid item xs={12}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: 'center',
                justifyContent: 'space-between',
                borderRadius: 4,
                background: 'linear-gradient(135deg, #4a148c 0%, #7c43bd 100%)',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '150px',
                  height: '150px',
                  background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                  borderRadius: '50%',
                  transform: 'translate(30%, -30%)',
                }}
              />
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, sm: 0 } }}>
                <Avatar
                  sx={{
                    bgcolor: 'secondary.main',
                    width: 60,
                    height: 60,
                    mr: 2,
                    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  {user?.fullName?.charAt(0).toUpperCase() || 'A'}
                </Avatar>
                <Box>
                  <Typography variant="h4" component="h1" fontWeight="bold">
                    Welcome, {user?.fullName || 'Admin'}!
                  </Typography>
                  <Typography variant="subtitle1">
                    Manage your exams and students
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Tooltip title="Refresh dashboard">
                  <IconButton color="inherit" onClick={fetchDashboardData} sx={{ mr: 1 }}>
                    <Refresh />
                  </IconButton>
                </Tooltip>
                <Button
                  variant="contained"
                  color="secondary"
                  component={RouterLink}
                  to="/admin/exams"
                  endIcon={<ArrowForward />}
                  sx={{
                    fontWeight: 'bold',
                    color: 'black',
                  }}
                >
                  Manage Exams
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* Stats Cards */}
          <Grid item xs={12}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Zoom in={true} style={{ transitionDelay: '200ms' }}>
                  <Card
                    elevation={3}
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '5px',
                        bgcolor: 'primary.main',
                      }}
                    />
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" component="h2" fontWeight="bold">
                          Students
                        </Typography>
                        <Avatar sx={{ bgcolor: 'primary.light' }}>
                          <People />
                        </Avatar>
                      </Box>
                      <Typography variant="h3" component="p" fontWeight="bold" color="primary.main">
                        {stats.totalStudents}
                      </Typography>
                      <Button
                        component={RouterLink}
                        to="/admin/students"
                        color="primary"
                        size="small"
                        sx={{ mt: 1 }}
                      >
                        View All
                      </Button>
                    </CardContent>
                  </Card>
                </Zoom>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Zoom in={true} style={{ transitionDelay: '300ms' }}>
                  <Card
                    elevation={3}
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '5px',
                        bgcolor: 'info.main',
                      }}
                    />
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" component="h2" fontWeight="bold">
                          Total Exams
                        </Typography>
                        <Avatar sx={{ bgcolor: 'info.light' }}>
                          <School />
                        </Avatar>
                      </Box>
                      <Typography variant="h3" component="p" fontWeight="bold" color="info.main">
                        {stats.totalExams}
                      </Typography>
                      <Button
                        component={RouterLink}
                        to="/admin/exams"
                        color="info"
                        size="small"
                        sx={{ mt: 1 }}
                      >
                        View All
                      </Button>
                    </CardContent>
                  </Card>
                </Zoom>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Zoom in={true} style={{ transitionDelay: '400ms' }}>
                  <Card
                    elevation={3}
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '5px',
                        bgcolor: 'success.main',
                      }}
                    />
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" component="h2" fontWeight="bold">
                          Active Exams
                        </Typography>
                        <Avatar sx={{ bgcolor: 'success.light' }}>
                          <LockOpen />
                        </Avatar>
                      </Box>
                      <Typography variant="h3" component="p" fontWeight="bold" color="success.main">
                        {stats.completedExams}
                      </Typography>
                      <Button
                        component={RouterLink}
                        to="/admin/exams"
                        color="success"
                        size="small"
                        sx={{ mt: 1 }}
                      >
                        View All
                      </Button>
                    </CardContent>
                  </Card>
                </Zoom>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Zoom in={true} style={{ transitionDelay: '500ms' }}>
                  <Card
                    elevation={3}
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '5px',
                        bgcolor: 'warning.main',
                      }}
                    />
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" component="h2" fontWeight="bold">
                          Pending Grading
                        </Typography>
                        <Avatar sx={{ bgcolor: 'warning.light' }}>
                          <Assessment />
                        </Avatar>
                      </Box>
                      <Typography variant="h3" component="p" fontWeight="bold" color="warning.main">
                        {stats.pendingGrading}
                      </Typography>
                      <Button
                        component={RouterLink}
                        to="/admin/results"
                        color="warning"
                        size="small"
                        sx={{ mt: 1 }}
                      >
                        View All
                      </Button>
                    </CardContent>
                  </Card>
                </Zoom>
              </Grid>
            </Grid>
          </Grid>

          {/* System Lock Control */}
          <Grid item xs={12}>
            <Zoom in={true} style={{ transitionDelay: '600ms' }}>
              <Card elevation={3}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h5" component="h2" fontWeight="bold">
                      System Lock Control
                    </Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={systemLocked}
                          onChange={handleSystemLockToggle}
                          color="primary"
                          disabled={lockLoading}
                        />
                      }
                      label={systemLocked ? 'System Locked' : 'System Unlocked'}
                    />
                  </Box>
                  
                  <Divider sx={{ mb: 2 }} />
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ mr: 2 }}>
                      {systemLocked ? (
                        <Avatar sx={{ bgcolor: 'error.main' }}>
                          <Lock />
                        </Avatar>
                      ) : (
                        <Avatar sx={{ bgcolor: 'success.main' }}>
                          <LockOpen />
                        </Avatar>
                      )}
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body1" fontWeight="medium">
                        {systemLocked 
                          ? 'The system is currently locked. Students can only access exams.' 
                          : 'The system is currently unlocked. Students have full access.'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {systemLocked 
                          ? 'When locked, students can only access and take exams, but cannot view other parts of the system.' 
                          : 'When unlocked, students have access to all features of the system.'}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <TextField
                    fullWidth
                    label="Lock Message (displayed to students when system is locked)"
                    value={lockMessage}
                    onChange={handleLockMessageChange}
                    variant="outlined"
                    margin="normal"
                    disabled={lockLoading}
                  />
                  
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSaveLockMessage}
                    disabled={lockLoading}
                    sx={{ mt: 2 }}
                  >
                    Save Message
                  </Button>
                </CardContent>
              </Card>
            </Zoom>
          </Grid>

          {/* Recent Exams */}
          <Grid item xs={12} md={7}>
            <Zoom in={true} style={{ transitionDelay: '700ms' }}>
              <Card elevation={3}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h5" component="h2" fontWeight="bold">
                      Recent Exams
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      component={RouterLink}
                      to="/admin/exams"
                      startIcon={<Add />}
                      size="small"
                    >
                      New Exam
                    </Button>
                  </Box>
                  
                  <Divider sx={{ mb: 2 }} />
                  
                  {loading ? (
                    <LinearProgress />
                  ) : recentExams.length > 0 ? (
                    recentExams.map((exam) => (
                      <Card 
                        key={exam._id} 
                        variant="outlined" 
                        sx={{ 
                          mb: 2,
                          transition: 'transform 0.2s',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                          }
                        }}
                      >
                        <CardContent sx={{ pb: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box>
                              <Typography variant="h6" component="h3" fontWeight="bold">
                                {exam.title}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {exam.description?.substring(0, 100)}
                                {exam.description?.length > 100 ? '...' : ''}
                              </Typography>
                            </Box>
                            <Chip
                              icon={exam.isLocked ? <Lock /> : <LockOpen />}
                              label={exam.isLocked ? 'Locked' : 'Unlocked'}
                              color={exam.isLocked ? 'error' : 'success'}
                              size="small"
                            />
                          </Box>
                        </CardContent>
                        <CardActions sx={{ justifyContent: 'flex-end' }}>
                          <Button
                            size="small"
                            component={RouterLink}
                            to={`/admin/results/${exam._id}`}
                            startIcon={<Assessment />}
                          >
                            Results
                          </Button>
                          <Button
                            size="small"
                            component={RouterLink}
                            to={`/admin/exams/${exam._id}`}
                            startIcon={<Edit />}
                          >
                            Edit
                          </Button>
                        </CardActions>
                      </Card>
                    ))
                  ) : (
                    <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
                      No exams available. Create your first exam!
                    </Typography>
                  )}
                  
                  {recentExams.length > 0 && (
                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                      <Button
                        component={RouterLink}
                        to="/admin/exams"
                        color="primary"
                        endIcon={<ArrowForward />}
                      >
                        View All Exams
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Zoom>
          </Grid>

          {/* Recent Students */}
          <Grid item xs={12} md={5}>
            <Zoom in={true} style={{ transitionDelay: '800ms' }}>
              <Card elevation={3}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h5" component="h2" fontWeight="bold">
                      Recent Students
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      component={RouterLink}
                      to="/admin/students"
                      startIcon={<Add />}
                      size="small"
                    >
                      Add Student
                    </Button>
                  </Box>
                  
                  <Divider sx={{ mb: 2 }} />
                  
                  {loading ? (
                    <LinearProgress />
                  ) : recentStudents.length > 0 ? (
                    recentStudents.map((student) => (
                      <Box 
                        key={student._id} 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          mb: 2,
                          p: 1,
                          borderRadius: 2,
                          transition: 'all 0.2s',
                          '&:hover': {
                            bgcolor: 'action.hover',
                          }
                        }}
                      >
                        <Avatar 
                          sx={{ 
                            mr: 2,
                            bgcolor: 'primary.main',
                            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
                          }}
                        >
                          {student.fullName.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="body1" fontWeight="medium">
                            {student.fullName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            ID: {student.studentId} | {student.email}
                          </Typography>
                        </Box>
                        <IconButton 
                          component={RouterLink} 
                          to={`/admin/students/${student._id}`}
                          color="primary"
                          size="small"
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
                      No students registered. Add your first student!
                    </Typography>
                  )}
                  
                  {recentStudents.length > 0 && (
                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                      <Button
                        component={RouterLink}
                        to="/admin/students"
                        color="primary"
                        endIcon={<ArrowForward />}
                      >
                        View All Students
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Zoom>
          </Grid>
        </Grid>
      </Grow>
    </Container>
  );
};

export default Dashboard;
