import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  Avatar,
  Divider,
  IconButton,
  Tooltip,
  CircularProgress,
  useTheme,
  alpha,
  Zoom,
  Fade,
  LinearProgress,
  Stack,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  CalendarToday as CalendarIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  ArrowForward as ArrowForwardIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CheckCircle as CheckCircleIcon,
  School as SchoolIcon,
  Timeline as TimelineIcon,
  Insights as InsightsIcon,
  Speed as SpeedIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Event as EventIcon,
  Security as SecurityIcon,
  EmojiEvents as EmojiEventsIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats, getRecentExams, getRecentStudents } from '../../../services/adminService';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';

const Home = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dashboard data states
  const [stats, setStats] = useState([
    {
      title: 'Total Students',
      value: 0,
      icon: <PeopleIcon />,
      color: theme.palette.primary.main,
      trend: 12,
      trendLabel: 'vs last month',
      tooltip: 'Total number of registered students'
    },
    {
      title: 'Active Exams',
      value: 0,
      icon: <AssignmentIcon />,
      color: theme.palette.secondary.main,
      trend: 5,
      trendLabel: 'vs last week',
      tooltip: 'Currently active exams'
    },
    {
      title: 'Upcoming Exams',
      value: 0,
      icon: <CalendarIcon />,
      color: theme.palette.success.main,
      trend: 8,
      trendLabel: 'new scheduled',
      tooltip: 'Exams scheduled for the future'
    },
    {
      title: 'Security Alerts',
      value: 0,
      icon: <WarningIcon />,
      color: theme.palette.error.main,
      trend: -3,
      trendLabel: 'vs last week',
      tooltip: 'Active security alerts requiring attention'
    }
  ]);

  const [recentExams, setRecentExams] = useState([]);
  const [recentStudents, setRecentStudents] = useState([]);
  const [activities, setActivities] = useState([]);
  const [performanceData, setPerformanceData] = useState({});
  const [completionRates, setCompletionRates] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);

  // Chart options for student performance
  const performanceChartOptions = {
    chart: {
      type: 'area',
      height: 350,
      toolbar: {
        show: false
      },
      fontFamily: theme.typography.fontFamily,
      foreColor: theme.palette.text.secondary
    },
    colors: [theme.palette.primary.main, theme.palette.secondary.main],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.2,
        stops: [0, 90, 100]
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: 3
    },
    grid: {
      borderColor: alpha(theme.palette.divider, 0.1),
      row: {
        colors: [alpha(theme.palette.background.default, 0.5), 'transparent'],
        opacity: 0.5
      }
    },
    markers: {
      size: 4
    },
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      labels: {
        style: {
          colors: theme.palette.text.secondary
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: theme.palette.text.secondary
        }
      }
    },
    tooltip: {
      theme: theme.palette.mode
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      labels: {
        colors: theme.palette.text.primary
      }
    }
  };

  // Chart options for exam completion rates
  const completionChartOptions = {
    chart: {
      type: 'donut',
      height: 350,
      fontFamily: theme.typography.fontFamily,
      foreColor: theme.palette.text.secondary
    },
    colors: [
      theme.palette.success.main,
      theme.palette.warning.main,
      theme.palette.error.main
    ],
    labels: ['Completed', 'In Progress', 'Not Started'],
    legend: {
      position: 'bottom',
      labels: {
        colors: theme.palette.text.primary
      }
    },
    dataLabels: {
      enabled: false
    },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '16px',
              fontWeight: 600,
              color: theme.palette.text.primary
            },
            value: {
              show: true,
              fontSize: '20px',
              fontWeight: 700,
              color: theme.palette.text.primary
            },
            total: {
              show: true,
              label: 'Total',
              fontSize: '16px',
              fontWeight: 600,
              color: theme.palette.text.primary
            }
          }
        }
      }
    }
  };

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get dashboard stats from API
      const statsData = await getDashboardStats();

      // Update stats with real data
      setStats([
        {
          title: 'Total Students',
          value: statsData.totalStudents || 0,
          icon: <PeopleIcon />,
          color: theme.palette.primary.main,
          trend: 12,
          trendLabel: 'vs last month',
          tooltip: 'Total number of registered students'
        },
        {
          title: 'Active Exams',
          value: statsData.activeExams || 0,
          icon: <AssignmentIcon />,
          color: theme.palette.secondary.main,
          trend: 5,
          trendLabel: 'vs last week',
          tooltip: 'Currently active exams'
        },
        {
          title: 'Upcoming Exams',
          value: statsData.upcomingExams || 0,
          icon: <CalendarIcon />,
          color: theme.palette.success.main,
          trend: 8,
          trendLabel: 'new scheduled',
          tooltip: 'Exams scheduled for the future'
        },
        {
          title: 'Security Alerts',
          value: statsData.securityAlerts || 0,
          icon: <WarningIcon />,
          color: theme.palette.error.main,
          trend: -3,
          trendLabel: 'vs last week',
          tooltip: 'Active security alerts requiring attention'
        }
      ]);

      // Set recent activities
      if (statsData.recentActivities) {
        setActivities(statsData.recentActivities);
      }

      // Get recent exams data from the API
      try {
        const recentExamsData = await getRecentExams();
        setRecentExams(recentExamsData);

        // If we have exams, try to fetch the leaderboard for the first exam
        if (recentExamsData && recentExamsData.length > 0) {
          try {
            const leaderboardResponse = await api.get(`/admin/exams/${recentExamsData[0].id}/leaderboard`);
            if (leaderboardResponse.data && leaderboardResponse.data.leaderboard) {
              // Get top 3 performers
              setTopPerformers(leaderboardResponse.data.leaderboard.slice(0, 3));
            }
          } catch (leaderboardError) {
            console.error('Error fetching leaderboard:', leaderboardError);
            // Set mock top performers if leaderboard fetch fails
            setTopPerformers([
              {
                id: '1',
                name: 'John Doe',
                studentClass: 'Science Class',
                percentage: 95,
                timeTaken: 45
              },
              {
                id: '2',
                name: 'Jane Smith',
                studentClass: 'Math Class',
                percentage: 92,
                timeTaken: 50
              },
              {
                id: '3',
                name: 'Alex Johnson',
                studentClass: 'History Class',
                percentage: 89,
                timeTaken: 55
              }
            ]);
          }
        }
      } catch (error) {
        console.error('Error fetching recent exams:', error);
      }

      // Get recent students data from the API
      try {
        const recentStudentsData = await getRecentStudents();
        setRecentStudents(recentStudentsData);
      } catch (error) {
        console.error('Error fetching recent students:', error);
      }

      // Set performance data for charts
      setPerformanceData({
        series: [
          {
            name: 'Average Score',
            data: [65, 72, 78, 75, 82, 88, 85, 83, 86, 90, 88, 92]
          },
          {
            name: 'Completion Rate',
            data: [70, 75, 80, 78, 85, 90, 88, 87, 89, 92, 90, 95]
          }
        ]
      });

      // Set completion rates for donut chart
      setCompletionRates([65, 25, 10]); // Completed, In Progress, Not Started

      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
      setLoading(false);

      // Set mock data if API fails
      setStats([
        {
          title: 'Total Students',
          value: 156,
          icon: <PeopleIcon />,
          color: theme.palette.primary.main,
          trend: 12,
          trendLabel: 'vs last month',
          tooltip: 'Total number of registered students'
        },
        {
          title: 'Active Exams',
          value: 8,
          icon: <AssignmentIcon />,
          color: theme.palette.secondary.main,
          trend: 5,
          trendLabel: 'vs last week',
          tooltip: 'Currently active exams'
        },
        {
          title: 'Upcoming Exams',
          value: 12,
          icon: <CalendarIcon />,
          color: theme.palette.success.main,
          trend: 8,
          trendLabel: 'new scheduled',
          tooltip: 'Exams scheduled for the future'
        },
        {
          title: 'Security Alerts',
          value: 2,
          icon: <WarningIcon />,
          color: theme.palette.error.main,
          trend: -3,
          trendLabel: 'vs last week',
          tooltip: 'Active security alerts requiring attention'
        }
      ]);

      // Set mock activities
      setActivities([
        {
          id: 1,
          type: 'student_added',
          user: 'John Doe',
          time: '2 hours ago'
        },
        {
          id: 2,
          type: 'exam_created',
          exam: 'Biology Final',
          time: '5 hours ago'
        },
        {
          id: 3,
          type: 'exam_completed',
          exam: 'Chemistry Quiz',
          students: 35,
          time: '1 day ago'
        },
        {
          id: 4,
          type: 'security_alert',
          student: 'Alice Smith',
          issue: 'Multiple device login',
          time: '2 days ago'
        }
      ]);

      // Set mock performance data
      setPerformanceData({
        series: [
          {
            name: 'Average Score',
            data: [65, 72, 78, 75, 82, 88, 85, 83, 86, 90, 88, 92]
          },
          {
            name: 'Completion Rate',
            data: [70, 75, 80, 78, 85, 90, 88, 87, 89, 92, 90, 95]
          }
        ]
      });

      // Set mock completion rates
      setCompletionRates([65, 25, 10]);
    }
  };

  // Navigation handlers
  const handleCreateExam = () => {
    navigate('/admin/exams/create');
  };

  const handleViewAllExams = () => {
    navigate('/admin/exams');
  };

  const handleAddStudent = () => {
    navigate('/admin/students/add');
  };

  const handleViewAllStudents = () => {
    navigate('/admin/students');
  };

  const handleViewAnalytics = () => {
    navigate('/admin/results/analytics');
  };

  const handleViewLeaderboard = () => {
    // Navigate to the main leaderboard page
    navigate('/admin/results/leaderboard');
  };

  const handleViewSecurity = () => {
    navigate('/admin/security/monitoring');
  };

  return (
    <Box>
      {/* Page header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Welcome to your admin dashboard. Here's an overview of your system.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Zoom in={true} timeout={800}>
        <Box>
          <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: 4 }}>
            {stats.map((stat, index) => (
              <Grid item xs={6} sm={6} md={3} key={`stat-card-${stat.title}-${index}`}>
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    borderRadius: { xs: 3, md: 4 },
                    p: { xs: 1, md: 1.5 },
                    background: alpha(stat.color, 0.05),
                    border: `1px solid ${alpha(stat.color, 0.1)}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: `0 8px 20px ${alpha(stat.color, 0.2)}`,
                      background: alpha(stat.color, 0.08),
                    }
                  }}
                >
                  <CardContent sx={{ p: { xs: 1, sm: 2 }, '&:last-child': { pb: { xs: 1, sm: 2 } } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography
                        variant="subtitle1"
                        component="h2"
                        fontWeight="bold"
                        color="text.primary"
                        sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                      >
                        {stat.title}
                      </Typography>
                      <Avatar
                        sx={{
                          bgcolor: alpha(stat.color, 0.2),
                          color: stat.color,
                          width: { xs: 32, sm: 40 },
                          height: { xs: 32, sm: 40 }
                        }}
                      >
                        {stat.icon}
                      </Avatar>
                    </Box>

                    <Typography
                      variant="h4"
                      component="div"
                      fontWeight="bold"
                      color={stat.color}
                      sx={{
                        mb: 1,
                        fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
                      }}
                    >
                      {loading ? <CircularProgress size={24} color="inherit" /> : stat.value}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          color: stat.trend >= 0 ? 'success.main' : 'error.main',
                          bgcolor: stat.trend >= 0 ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.error.main, 0.1),
                          borderRadius: 1,
                          px: 1,
                          py: 0.5
                        }}
                      >
                        {stat.trend >= 0 ? <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} /> : <TrendingDownIcon fontSize="small" sx={{ mr: 0.5 }} />}
                        <Typography variant="caption" fontWeight="bold">
                          {Math.abs(stat.trend)}%
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                        {stat.trendLabel}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Zoom>

      {/* Recent Activity Section */}
      <Grid container spacing={{ xs: 2, md: 4 }}>
        {/* Recent Exams */}
        <Grid item xs={12} md={6}>
          <Fade in={true} timeout={1000}>
            <Card elevation={0} sx={{ borderRadius: { xs: 3, md: 4 }, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Box sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  justifyContent: 'space-between',
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  mb: 2
                }}>
                  <Typography
                    variant="h6"
                    component="h2"
                    fontWeight="bold"
                    sx={{ mb: { xs: 1, sm: 0 } }}
                  >
                    Recent Exams
                  </Typography>
                  <Box sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 1
                  }}>
                    <Tooltip title="Refresh">
                      <IconButton size="small" onClick={fetchDashboardData}>
                        <RefreshIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={handleCreateExam}
                    >
                      New Exam
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      endIcon={<ArrowForwardIcon />}
                      onClick={handleViewAllExams}
                    >
                      View All
                    </Button>
                  </Box>
                </Box>

                <Divider sx={{ mb: 2 }} />

                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : recentExams.length === 0 ? (
                  <Box sx={{ textAlign: 'center', p: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      No exams found. Create your first exam.
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={handleCreateExam}
                      sx={{ mt: 2 }}
                    >
                      Create Exam
                    </Button>
                  </Box>
                ) : (
                  <Box>
                    {recentExams.map((exam, index) => (
                      <Card
                        key={`recent-exam-${exam.id || index}-${index}`}
                        variant="outlined"
                        sx={{
                          mb: 2,
                          borderRadius: 3,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateX(5px)',
                            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                          }
                        }}
                      >
                        <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
                          <Grid container alignItems="center" spacing={1}>
                            <Grid item xs={12} sm={7}>
                              <Typography
                                variant="subtitle1"
                                fontWeight="bold"
                                sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                              >
                                {exam.title}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                              >
                                {exam.date} at {exam.time}
                              </Typography>
                            </Grid>
                            <Grid item xs={6} sm={3} sx={{ textAlign: { xs: 'left', sm: 'center' } }}>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                              >
                                Students
                              </Typography>
                              <Typography
                                variant="subtitle2"
                                fontWeight="bold"
                                sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}
                              >
                                {exam.students}
                              </Typography>
                            </Grid>
                            <Grid item xs={6} sm={2} sx={{ textAlign: 'right' }}>
                              <Box
                                sx={{
                                  display: 'inline-block',
                                  px: 1.5,
                                  py: 0.5,
                                  borderRadius: 1,
                                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                  fontWeight: 'bold',
                                  textTransform: 'capitalize',
                                  bgcolor: exam.status === 'active'
                                    ? alpha(theme.palette.success.main, 0.1)
                                    : exam.status === 'completed'
                                      ? alpha(theme.palette.info.main, 0.1)
                                      : alpha(theme.palette.warning.main, 0.1),
                                  color: exam.status === 'active'
                                    ? theme.palette.success.main
                                    : exam.status === 'completed'
                                      ? theme.palette.info.main
                                      : theme.palette.warning.main,
                                }}
                              >
                                {exam.status}
                              </Box>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Fade>
        </Grid>

        {/* Recent Students */}
        <Grid item xs={12} md={6}>
          <Fade in={true} timeout={1200}>
            <Card elevation={0} sx={{ borderRadius: { xs: 3, md: 4 }, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Box sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  justifyContent: 'space-between',
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  mb: 2
                }}>
                  <Typography
                    variant="h6"
                    component="h2"
                    fontWeight="bold"
                    sx={{ mb: { xs: 1, sm: 0 } }}
                  >
                    Recent Students
                  </Typography>
                  <Box sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 1
                  }}>
                    <Tooltip title="Refresh">
                      <IconButton size="small" onClick={fetchDashboardData}>
                        <RefreshIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={handleAddStudent}
                    >
                      Add Student
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      endIcon={<ArrowForwardIcon />}
                      onClick={handleViewAllStudents}
                    >
                      View All
                    </Button>
                  </Box>
                </Box>

                <Divider sx={{ mb: 2 }} />

                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : recentStudents.length === 0 ? (
                  <Box sx={{ textAlign: 'center', p: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      No students found. Add your first student.
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={handleAddStudent}
                      sx={{ mt: 2 }}
                    >
                      Add Student
                    </Button>
                  </Box>
                ) : (
                  <Box>
                    {recentStudents.map((student, index) => (
                      <Card
                        key={`recent-student-${student.id || index}-${index}`}
                        variant="outlined"
                        sx={{
                          mb: 2,
                          borderRadius: 3,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateX(5px)',
                            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                          }
                        }}
                      >
                        <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
                          <Grid container alignItems="center" spacing={1}>
                            <Grid item xs={3} sm={2}>
                              <Avatar
                                sx={{
                                  bgcolor: theme.palette.primary.main,
                                  width: { xs: 32, sm: 40 },
                                  height: { xs: 32, sm: 40 }
                                }}
                              >
                                {student.name.charAt(0)}
                              </Avatar>
                            </Grid>
                            <Grid item xs={9} sm={7}>
                              <Typography
                                variant="subtitle1"
                                fontWeight="bold"
                                sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                              >
                                {student.name}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {student.email}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={3} sx={{ textAlign: { xs: 'left', sm: 'right' }, pl: { xs: 3, sm: 1 } }}>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                              >
                                Registered
                              </Typography>
                              <Typography
                                variant="body2"
                                fontWeight="medium"
                                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                              >
                                {student.registeredDate}
                              </Typography>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Fade>
        </Grid>
      </Grid>

      {/* Leaderboard Highlight */}
      <Fade in={true} timeout={1250}>
        <Card
          elevation={3}
          sx={{
            mt: 4,
            borderRadius: 4,
            background: 'linear-gradient(135deg, #FF9800 0%, #ED6C02 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: -20,
              right: -20,
              width: 120,
              height: 120,
              borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,0.1)'
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: -30,
              left: -30,
              width: 150,
              height: 150,
              borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,0.1)'
            }}
          />
          <CardContent sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <EmojiEventsIcon sx={{ fontSize: 32, mr: 1 }} />
                <Typography variant="h5" component="h2" fontWeight="bold">
                  Student Leaderboard
                </Typography>
              </Box>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<ArrowForwardIcon />}
                onClick={() => handleViewLeaderboard()}
                sx={{
                  color: 'black',
                  fontWeight: 'bold',
                  '&:hover': {
                    bgcolor: '#FFF',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                View Leaderboard
              </Button>
            </Box>

            <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
              Check out the top-performing students across all exams. See who's leading the class!
            </Typography>

            <Grid container spacing={2}>
              {loading ? (
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress sx={{ color: 'white' }} />
                  </Box>
                </Grid>
              ) : topPerformers.length > 0 ? (
                topPerformers.map((student, index) => (
                  <Grid item xs={12} sm={4} key={`top-performer-${student.id || student.uniqueId || index}-${index}`}>
                    <Card
                      elevation={2}
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.9)',
                        color: 'black',
                        borderRadius: 3,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
                        }
                      }}
                    >
                      <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Box
                            sx={{
                              width: 30,
                              height: 30,
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 'bold',
                              mr: 1,
                              bgcolor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32',
                              color: index === 0 ? 'black' : index === 1 ? 'black' : 'white'
                            }}
                          >
                            {index + 1}
                          </Box>
                          <Typography variant="h6" fontWeight="bold">
                            {student.name}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {student.studentClass || 'N/A'}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" fontWeight="medium">
                            Score: <strong>{student.percentage}%</strong>
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {student.timeTaken} min
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Card
                    elevation={2}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.9)',
                      color: 'black',
                      borderRadius: 3,
                      p: 2,
                      textAlign: 'center'
                    }}
                  >
                    <Typography variant="body1">
                      No student performance data available yet.
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => navigate('/admin/results')}
                      sx={{ mt: 2 }}
                    >
                      View Results
                    </Button>
                  </Card>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      </Fade>

      {/* Recent Activities */}
      <Fade in={true} timeout={1300}>
        <Card elevation={0} sx={{ mt: 4, borderRadius: 4, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" component="h2" fontWeight="bold">
                Recent Activities
              </Typography>
              <Tooltip title="Refresh">
                <IconButton size="small" onClick={fetchDashboardData}>
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box>
                {/* Activity items */}
                <Stack spacing={2}>
                  {[
                    {
                      id: 'activity-1',
                      type: 'student',
                      title: 'New student registered',
                      description: 'John Doe has registered as a new student',
                      time: '2 hours ago',
                      color: theme.palette.primary.main,
                      icon: <PeopleIcon />
                    },
                    {
                      id: 'activity-2',
                      type: 'exam-created',
                      title: 'Exam created',
                      description: 'Biology Final exam has been created',
                      time: '5 hours ago',
                      color: theme.palette.secondary.main,
                      icon: <AssignmentIcon />
                    },
                    {
                      id: 'activity-3',
                      type: 'exam-completed',
                      title: 'Exam completed',
                      description: 'Chemistry Quiz completed by 35 students',
                      time: '1 day ago',
                      color: theme.palette.success.main,
                      icon: <AssignmentIcon />
                    },
                    {
                      id: 'activity-4',
                      type: 'security',
                      title: 'Security alert',
                      description: 'Multiple device login detected for Alice Smith',
                      time: '2 days ago',
                      color: theme.palette.error.main,
                      icon: <WarningIcon />
                    }
                  ].map((activity, index) => (
                    <Card
                      key={`activity-card-${activity.id}-${index}`}
                      variant="outlined"
                      sx={{
                        borderRadius: 3,
                        borderColor: alpha(activity.color, 0.2)
                      }}
                    >
                      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ bgcolor: alpha(activity.color, 0.1), color: activity.color }}>
                            {activity.icon}
                          </Avatar>
                          <Box sx={{ ml: 2 }}>
                            <Typography variant="body1" fontWeight="medium">
                              {activity.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {activity.description}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {activity.time}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              </Box>
            )}
          </CardContent>
        </Card>
      </Fade>

      {/* Quick Actions */}
      <Fade in={true} timeout={1400}>
        <Paper
          elevation={0}
          sx={{
            mt: { xs: 3, md: 4 },
            p: { xs: 2, md: 3 },
            borderRadius: { xs: 3, md: 4 },
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})`,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
          }}
        >
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Quick Actions
          </Typography>
          <Grid container spacing={{ xs: 1.5, md: 2 }} sx={{ mt: 0.5 }}>
            <Grid item xs={6} sm={6} md={2.4}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleCreateExam}
                sx={{
                  py: { xs: 1, md: 1.5 },
                  px: { xs: 1, sm: 2 },
                  borderRadius: 3,
                  boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.3)}`,
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  '& .MuiButton-startIcon': {
                    marginRight: { xs: 0.5, sm: 1 }
                  }
                }}
              >
                <Box sx={{ display: { xs: 'none', sm: 'inline' } }}>Create New</Box> Exam
              </Button>
            </Grid>
            <Grid item xs={6} sm={6} md={2.4}>
              <Button
                fullWidth
                variant="contained"
                color="secondary"
                startIcon={<PeopleIcon />}
                onClick={handleAddStudent}
                sx={{
                  py: { xs: 1, md: 1.5 },
                  px: { xs: 1, sm: 2 },
                  borderRadius: 3,
                  boxShadow: `0 4px 14px ${alpha(theme.palette.secondary.main, 0.3)}`,
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  '& .MuiButton-startIcon': {
                    marginRight: { xs: 0.5, sm: 1 }
                  }
                }}
              >
                <Box sx={{ display: { xs: 'none', sm: 'inline' } }}>Add New</Box> Student
              </Button>
            </Grid>
            <Grid item xs={6} sm={6} md={2.4}>
              <Button
                fullWidth
                variant="contained"
                color="success"
                startIcon={<CalendarIcon />}
                onClick={() => navigate('/admin/exams/schedule')}
                sx={{
                  py: { xs: 1, md: 1.5 },
                  px: { xs: 1, sm: 2 },
                  borderRadius: 3,
                  boxShadow: `0 4px 14px ${alpha(theme.palette.success.main, 0.3)}`,
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  '& .MuiButton-startIcon': {
                    marginRight: { xs: 0.5, sm: 1 }
                  }
                }}
              >
                <Box sx={{ display: { xs: 'none', sm: 'inline' } }}>Schedule</Box> Exam
              </Button>
            </Grid>
            <Grid item xs={6} sm={6} md={2.4}>
              <Button
                fullWidth
                variant="contained"
                color="info"
                startIcon={<AssignmentIcon />}
                onClick={() => navigate('/admin/exams/grading')}
                sx={{
                  py: { xs: 1, md: 1.5 },
                  px: { xs: 1, sm: 2 },
                  borderRadius: 3,
                  boxShadow: `0 4px 14px ${alpha(theme.palette.info.main, 0.3)}`,
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  '& .MuiButton-startIcon': {
                    marginRight: { xs: 0.5, sm: 1 }
                  }
                }}
              >
                <Box sx={{ display: { xs: 'none', sm: 'inline' } }}>AI</Box> Grading
              </Button>
            </Grid>
            <Grid item xs={6} sm={6} md={2.4}>
              <Button
                fullWidth
                variant="contained"
                color="warning"
                startIcon={<EmojiEventsIcon />}
                onClick={() => handleViewLeaderboard()}
                sx={{
                  py: { xs: 1, md: 1.5 },
                  px: { xs: 1, sm: 2 },
                  borderRadius: 3,
                  boxShadow: `0 4px 14px ${alpha(theme.palette.warning.main, 0.3)}`,
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  '& .MuiButton-startIcon': {
                    marginRight: { xs: 0.5, sm: 1 }
                  }
                }}
              >
                <Box sx={{ display: { xs: 'none', sm: 'inline' } }}>View</Box> Leaderboard
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Fade>
    </Box>
  );
};

export default Home;
