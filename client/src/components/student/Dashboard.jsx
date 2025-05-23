import { useState, useEffect, useContext } from 'react';
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
  CardMedia,
  Divider,
  Avatar,
  Chip,
  LinearProgress,
  Grow,
  Zoom,
  Badge,
  IconButton,
  Tooltip,
  Skeleton,
  useTheme,
  alpha
} from '@mui/material';
import {
  School,
  AssignmentTurnedIn,
  EmojiEvents,
  ArrowForward,
  CheckCircle,
  AccessTime,
  PlayArrow,
  CalendarToday,
  Refresh,
  Star,
  StarBorder,
  StarHalf,
  LocalFireDepartment,
  Celebration,
  WorkspacePremium,
  AutoGraph,
  Leaderboard as LeaderboardIcon,
  Assessment
} from '@mui/icons-material';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { getClassLeaderboard } from '../../services/studentService';
import StudentLayout from './StudentLayout';

// Import gamification components
import StatsCard from '../gamification/StatsCard';
import ProgressCard from '../gamification/ProgressCard';
import AchievementCard from '../gamification/AchievementCard';
import Leaderboard from '../gamification/Leaderboard';

const Dashboard = () => {
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalExams: 0,
    completedExams: 0,
    availableExams: 0,
    averageScore: 0,
    totalPoints: 0,
    streak: 0,
    rank: 0,
    level: 1,
    xp: 0,
    nextLevelXp: 100
  });
  const [recentExams, setRecentExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState([]);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [studyStreak] = useState(5); // Days in a row

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch available exams - removing the duplicate /api prefix
        const examsRes = await api.get('/student/exams');

        // Fetch results - removing the duplicate /api prefix
        const resultsRes = await api.get('/student/results');

        // Calculate stats
        const exams = examsRes.data;
        const results = resultsRes.data;

        const completed = exams.filter(exam => exam.status === 'completed').length;
        const available = exams.filter(exam => exam.status === 'not-started').length;
        const inProgress = exams.filter(exam => exam.status === 'in-progress').length;

        // Calculate average score
        let totalScore = 0;
        let totalMaxScore = 0;

        results.forEach(result => {
          totalScore += result.totalScore;
          totalMaxScore += result.maxPossibleScore;
        });

        const averageScore = totalMaxScore > 0
          ? Math.round((totalScore / totalMaxScore) * 100)
          : 0;

        // Calculate gamification stats
        const totalPoints = completed * 100 + Math.round(totalScore * 0.5);
        const streak = Math.min(5, completed); // Mock streak data
        const level = Math.floor(totalPoints / 100) + 1;
        const xp = totalPoints % 100;
        const nextLevelXp = 100;
        const rank = 3; // Mock rank data

        setStats({
          totalExams: exams.length,
          completedExams: completed,
          availableExams: available,
          averageScore,
          totalPoints,
          streak,
          rank,
          level,
          xp,
          nextLevelXp
        });

        // Get recent exams (both completed and available)
        const sortedExams = [...exams].sort((a, b) => {
          // Sort by status (in-progress first, then not-started, then completed)
          const statusOrder = { 'in-progress': 0, 'not-started': 1, 'completed': 2 };
          return statusOrder[a.status] - statusOrder[b.status];
        }).slice(0, 3); // Get top 3

        setRecentExams(sortedExams);

        // Mock achievements data
        setAchievements([
          {
            id: 1,
            title: 'First Exam',
            description: 'Complete your first exam',
            progress: completed > 0 ? 1 : 0,
            maxProgress: 1,
            level: 1,
            type: completed > 0 ? 'gold' : 'bronze',
            icon: 'trophy',
            unlocked: completed > 0
          },
          {
            id: 2,
            title: 'Perfect Score',
            description: 'Get 100% on any exam',
            progress: averageScore === 100 ? 1 : 0,
            maxProgress: 1,
            level: 2,
            type: 'platinum',
            icon: 'star',
            unlocked: averageScore === 100
          },
          {
            id: 3,
            title: 'Exam Master',
            description: 'Complete 5 exams',
            progress: completed,
            maxProgress: 5,
            level: 3,
            type: 'silver',
            icon: 'bolt',
            unlocked: completed >= 5
          },
          {
            id: 4,
            title: 'Study Streak',
            description: 'Maintain a 5-day study streak',
            progress: studyStreak,
            maxProgress: 5,
            level: 2,
            type: studyStreak >= 5 ? 'gold' : 'bronze',
            icon: 'fire',
            unlocked: studyStreak >= 5
          }
        ]);

        // Fetch real leaderboard data
        try {
          const leaderboardResponse = await getClassLeaderboard();
          if (leaderboardResponse && leaderboardResponse.leaderboard) {
            // Format the data for the leaderboard component
            const formattedLeaderboard = leaderboardResponse.leaderboard.map(student => ({
              id: student.id,
              name: student.name,
              score: student.percentage || student.score || 0,
              avatar: '',
              isCurrentUser: student.isCurrentUser,
              studentClass: student.studentClass,
              examCount: student.examCount
            }));
            setLeaderboardData(formattedLeaderboard);
          } else {
            // Fallback to mock data if no real data is available
            setLeaderboardData([
              { id: user?.id || 1, name: user?.firstName ? `${user.firstName} ${user.lastName}` : 'You', score: totalPoints, avatar: '', isCurrentUser: true }
            ]);
          }
        } catch (leaderboardError) {
          console.error('Error fetching leaderboard:', leaderboardError);
          // Fallback to mock data if there's an error
          setLeaderboardData([
            { id: user?.id || 1, name: user?.firstName ? `${user.firstName} ${user.lastName}` : 'You', score: totalPoints, avatar: '', isCurrentUser: true }
          ]);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, studyStreak]);

  // Function to get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'warning';
      case 'not-started':
        return 'info';
      default:
        return 'default';
    }
  };

  // Function to get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle />;
      case 'in-progress':
        return <AccessTime />;
      case 'not-started':
        return <PlayArrow />;
      default:
        return null;
    }
  };

  // Helper functions for UI elements

  // Get current date
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <StudentLayout>
      <Container maxWidth="lg" sx={{ mb: { xs: 4, sm: 6, md: 8 }, px: { xs: 1, sm: 2, md: 3 } }}>
        {/* Hero Section */}
        <Grow in={true} timeout={800}>
          <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
          {/* Hero Card with Level Progress - Enhanced */}
          <Grid item xs={12}>
            <Paper
              elevation={4}
              sx={{
                p: { xs: 3, sm: 4, md: 5 },
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: 'center',
                justifyContent: 'space-between',
                borderRadius: { xs: 3, md: 4 },
                background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                gap: { xs: 3, md: 4 },
                boxShadow: `0 15px 35px ${alpha(theme.palette.primary.main, 0.4)}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: `0 20px 45px ${alpha(theme.palette.primary.main, 0.5)}`,
                  transform: 'translateY(-5px)'
                }
              }}
            >
              {/* Decorative elements */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: { xs: '100px', sm: '120px', md: '150px' },
                  height: { xs: '100px', sm: '120px', md: '150px' },
                  background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                  borderRadius: '50%',
                  transform: 'translate(30%, -30%)',
                  display: { xs: 'none', sm: 'block' }
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: { xs: '80px', sm: '100px', md: '120px' },
                  height: { xs: '80px', sm: '100px', md: '120px' },
                  background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                  borderRadius: '50%',
                  transform: 'translate(-30%, 30%)',
                  display: { xs: 'none', sm: 'block' }
                }}
              />

              <Box sx={{
                display: 'flex',
                alignItems: { xs: 'flex-start', sm: 'center' },
                flexDirection: { xs: 'column', sm: 'row' },
                mb: { xs: 2, md: 0 },
                width: { xs: '100%', md: 'auto' },
                gap: { xs: 3, sm: 4 }
              }}>
                <Box sx={{ position: 'relative' }}>
                  <Avatar
                    sx={{
                      bgcolor: theme.palette.secondary.main,
                      width: { xs: 70, sm: 80, md: 90 },
                      height: { xs: 70, sm: 80, md: 90 },
                      boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)',
                      border: '4px solid rgba(255,255,255,0.2)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.4)',
                      }
                    }}
                  >
                    {user?.firstName?.charAt(0).toUpperCase() || 'S'}
                  </Avatar>
                  <Tooltip title="Your current level" arrow placement="top">
                    <Avatar
                      sx={{
                        position: 'absolute',
                        bottom: -10,
                        right: -10,
                        width: { xs: 32, sm: 36, md: 40 },
                        height: { xs: 32, sm: 36, md: 40 },
                        bgcolor: theme.palette.secondary.main,
                        color: 'white',
                        border: '3px solid white',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                        fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
                        fontWeight: 'bold',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.1) rotate(10deg)',
                        }
                      }}
                    >
                      {loading ? '...' : stats.level}
                    </Avatar>
                  </Tooltip>
                </Box>
                <Box sx={{ maxWidth: { xs: '100%', md: '350px' } }}>
                  <Typography
                    variant="h3"
                    component="h1"
                    fontWeight="bold"
                    sx={{
                      fontSize: { xs: '1.7rem', sm: '2rem', md: '2.4rem', lg: '2.7rem' },
                      textShadow: '0 4px 12px rgba(0,0,0,0.3)',
                      lineHeight: 1.2,
                      mb: 1,
                      background: 'linear-gradient(90deg, #ffffff, #e0e0e0)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      letterSpacing: '0.5px'
                    }}
                  >
                    Welcome back, {user?.firstName || 'Student'}!
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: 'rgba(255,255,255,0.8)',
                      mb: 2,
                      fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                      maxWidth: '90%'
                    }}
                  >
                    Track your progress, take exams, and improve your scores. Your learning journey continues!
                  </Typography>

                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mt: 1,
                    flexWrap: 'wrap',
                    gap: 1.5
                  }}>
                    <Chip
                      icon={<WorkspacePremium sx={{
                        color: 'white !important',
                        fontSize: { xs: '1rem', sm: '1.1rem' }
                      }} />}
                      label={`${loading ? '...' : stats.totalPoints} XP`}
                      sx={{
                        bgcolor: alpha(theme.palette.secondary.main, 0.3),
                        color: 'white',
                        borderRadius: 6,
                        height: { xs: 32, sm: 36 },
                        border: '1px solid rgba(255,255,255,0.2)',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: alpha(theme.palette.secondary.main, 0.4),
                          transform: 'translateY(-2px)'
                        },
                        '& .MuiChip-label': {
                          fontWeight: 'bold',
                          fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.9rem' },
                          px: { xs: 1.5, sm: 2 }
                        },
                        '& .MuiChip-icon': {
                          ml: { xs: 0.75, sm: 1 }
                        }
                      }}
                    />
                    <Chip
                      icon={<LocalFireDepartment sx={{
                        color: 'white !important',
                        fontSize: { xs: '1rem', sm: '1.1rem' }
                      }} />}
                      label={`${loading ? '...' : stats.streak} Day Streak`}
                      sx={{
                        bgcolor: alpha('#ff9800', 0.3),
                        color: 'white',
                        borderRadius: 6,
                        height: { xs: 32, sm: 36 },
                        border: '1px solid rgba(255,255,255,0.2)',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: alpha('#ff9800', 0.4),
                          transform: 'translateY(-2px)'
                        },
                        '& .MuiChip-label': {
                          fontWeight: 'bold',
                          fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.9rem' },
                          px: { xs: 1.5, sm: 2 }
                        },
                        '& .MuiChip-icon': {
                          ml: { xs: 0.75, sm: 1 }
                        }
                      }}
                    />
                    <Chip
                      icon={<CalendarToday sx={{
                        color: 'white !important',
                        fontSize: { xs: '1rem', sm: '1.1rem' }
                      }} />}
                      label={currentDate}
                      sx={{
                        bgcolor: alpha(theme.palette.info.main, 0.3),
                        color: 'white',
                        borderRadius: 6,
                        height: { xs: 32, sm: 36 },
                        border: '1px solid rgba(255,255,255,0.2)',
                        display: { xs: 'none', md: 'flex' },
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: alpha(theme.palette.info.main, 0.4),
                          transform: 'translateY(-2px)'
                        },
                        '& .MuiChip-label': {
                          fontWeight: 'bold',
                          fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.9rem' },
                          px: { xs: 1.5, sm: 2 }
                        },
                        '& .MuiChip-icon': {
                          ml: { xs: 0.75, sm: 1 }
                        }
                      }}
                    />
                  </Box>

                  {/* Level Progress Bar */}
                  <Box sx={{ mt: 3, width: '100%', maxWidth: { xs: '100%', sm: 350 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        sx={{
                          fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.85rem' },
                          color: 'rgba(255,255,255,0.9)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5
                        }}
                      >
                        <WorkspacePremium fontSize="small" /> Level {loading ? '...' : stats.level}
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        sx={{
                          fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.85rem' },
                          color: 'rgba(255,255,255,0.9)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5
                        }}
                      >
                        {loading ? '...' : stats.xp}/{loading ? '...' : stats.nextLevelXp} XP
                      </Typography>
                    </Box>
                    <Box sx={{ position: 'relative' }}>
                      <LinearProgress
                        variant="determinate"
                        value={loading ? 0 : (stats.xp / stats.nextLevelXp) * 100}
                        sx={{
                          height: { xs: 8, sm: 10 },
                          borderRadius: 10,
                          bgcolor: 'rgba(255,255,255,0.15)',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: theme.palette.secondary.main,
                            borderRadius: 10,
                            backgroundImage: `linear-gradient(90deg, ${alpha(theme.palette.secondary.main, 0.8)}, ${theme.palette.secondary.main})`,
                            boxShadow: `0 0 10px ${alpha(theme.palette.secondary.main, 0.5)}`,
                            transition: 'transform 1.5s cubic-bezier(0.4, 0, 0.2, 1)'
                          }
                        }}
                      />
                      {/* Animated dots on progress bar */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: '50%',
                          left: `${loading ? 0 : Math.min(98, (stats.xp / stats.nextLevelXp) * 100)}%`,
                          transform: 'translate(-50%, -50%)',
                          width: { xs: 12, sm: 16 },
                          height: { xs: 12, sm: 16 },
                          borderRadius: '50%',
                          bgcolor: 'white',
                          boxShadow: `0 0 10px ${theme.palette.secondary.main}`,
                          animation: 'pulse 1.5s infinite',
                          '@keyframes pulse': {
                            '0%': {
                              boxShadow: `0 0 0 0 ${alpha(theme.palette.secondary.main, 0.7)}`
                            },
                            '70%': {
                              boxShadow: `0 0 0 6px ${alpha(theme.palette.secondary.main, 0)}`
                            },
                            '100%': {
                              boxShadow: `0 0 0 0 ${alpha(theme.palette.secondary.main, 0)}`
                            }
                          }
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              </Box>

              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: { xs: 1, sm: 2 },
                width: { xs: '100%', md: 'auto' },
                justifyContent: { xs: 'center', md: 'flex-end' }
              }}>
                <Tooltip title={`${stats.availableExams} exams available`}>
                  <Badge
                    badgeContent={stats.availableExams}
                    color="secondary"
                    overlap="circular"
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    sx={{
                      '& .MuiBadge-badge': {
                        fontSize: { xs: '0.65rem', sm: '0.75rem' },
                        height: { xs: 16, sm: 20 },
                        minWidth: { xs: 16, sm: 20 }
                      }
                    }}
                  >
                    <Button
                      variant="contained"
                      color="secondary"
                      component={RouterLink}
                      to="/student/exams"
                      endIcon={<ArrowForward sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />}
                      sx={{
                        fontWeight: 'bold',
                        color: 'black',
                        px: { xs: 2, sm: 3 },
                        py: { xs: 1, sm: 1.2 },
                        borderRadius: { xs: 1, md: 2 },
                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                      }}
                    >
                      Available Exams
                    </Button>
                  </Badge>
                </Tooltip>

                <Button
                  variant="outlined"
                  component={RouterLink}
                  to="/student/results"
                  endIcon={<Assessment sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />}
                  sx={{
                    fontWeight: 'medium',
                    color: 'white',
                    borderColor: 'rgba(255,255,255,0.5)',
                    borderRadius: { xs: 1, md: 2 },
                    px: { xs: 1.5, sm: 2 },
                    py: { xs: 0.75, sm: 1 },
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: 'rgba(255,255,255,0.1)',
                    }
                  }}
                >
                  My Results
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* Stats Cards - Enhanced */}
          <Grid item xs={12}>
            <Box
              sx={{
                mb: { xs: 2, sm: 3 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 1
              }}
            >
              <Typography
                variant="h5"
                fontWeight="bold"
                sx={{
                  fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
                  display: 'flex',
                  alignItems: 'center',
                  '&::before': {
                    content: '""',
                    display: 'inline-block',
                    width: { xs: 16, sm: 20 },
                    height: { xs: 3, sm: 4 },
                    borderRadius: 4,
                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    mr: 1.5
                  }
                }}
              >
                Your Dashboard
              </Typography>
              <Tooltip title="Refresh dashboard data">
                <IconButton
                  size="small"
                  onClick={() => fetchDashboardData()}
                  sx={{
                    color: theme.palette.primary.main,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.2),
                    }
                  }}
                >
                  <Refresh fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Box
              sx={{
                p: { xs: 2, sm: 3 },
                borderRadius: { xs: 2, md: 3 },
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.03)} 0%, ${alpha(theme.palette.secondary.main, 0.03)} 100%)`,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                mb: { xs: 2, sm: 3 },
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Decorative elements */}
              <Box
                sx={{
                  position: 'absolute',
                  top: -30,
                  right: -30,
                  width: 150,
                  height: 150,
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
                  display: { xs: 'none', sm: 'block' }
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -20,
                  left: -20,
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 70%)`,
                  display: { xs: 'none', sm: 'block' }
                }}
              />
              <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }} sx={{ position: 'relative', zIndex: 1 }}>
              {/* Using StatsCard component for Total Exams */}
              <Grid item xs={6} sm={6} md={3}>
                <Zoom in={true} style={{ transitionDelay: '200ms' }}>
                  <Box>
                    <StatsCard
                      title="Total Exams"
                      value={loading ? "..." : stats.totalExams}
                      icon={<School sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }} />}
                      color={theme.palette.primary.main}
                      tooltip="Total number of exams assigned to you"
                      titleFontSize={{ xs: '0.75rem', sm: '0.875rem', md: '1rem' }}
                      valueFontSize={{ xs: '1.25rem', sm: '1.5rem', md: '2rem' }}
                      iconSize={{ xs: 40, sm: 48, md: 56 }}
                      height={{ xs: '100%', md: '100%' }}
                      padding={{ xs: 1.5, sm: 2, md: 2.5 }}
                    />
                  </Box>
                </Zoom>
              </Grid>

              {/* Using StatsCard component for Completed Exams */}
              <Grid item xs={6} sm={6} md={3}>
                <Zoom in={true} style={{ transitionDelay: '300ms' }}>
                  <Box>
                    <StatsCard
                      title="Completed Exams"
                      value={loading ? "..." : stats.completedExams}
                      icon={<AssignmentTurnedIn sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }} />}
                      color={theme.palette.success.main}
                      trend={loading ? null : stats.completedExams > 0 ? 10 : 0}
                      trendLabel="vs last week"
                      tooltip="Number of exams you have completed"
                      titleFontSize={{ xs: '0.75rem', sm: '0.875rem', md: '1rem' }}
                      valueFontSize={{ xs: '1.25rem', sm: '1.5rem', md: '2rem' }}
                      iconSize={{ xs: 40, sm: 48, md: 56 }}
                      height={{ xs: '100%', md: '100%' }}
                      padding={{ xs: 1.5, sm: 2, md: 2.5 }}
                    />
                  </Box>
                </Zoom>
              </Grid>

              {/* Using StatsCard component for Available Exams */}
              <Grid item xs={6} sm={6} md={3}>
                <Zoom in={true} style={{ transitionDelay: '400ms' }}>
                  <Box>
                    <StatsCard
                      title="Available Exams"
                      value={loading ? "..." : stats.availableExams}
                      icon={<PlayArrow sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }} />}
                      color={theme.palette.info.main}
                      tooltip="Number of exams available to take"
                      titleFontSize={{ xs: '0.75rem', sm: '0.875rem', md: '1rem' }}
                      valueFontSize={{ xs: '1.25rem', sm: '1.5rem', md: '2rem' }}
                      iconSize={{ xs: 40, sm: 48, md: 56 }}
                      height={{ xs: '100%', md: '100%' }}
                      padding={{ xs: 1.5, sm: 2, md: 2.5 }}
                    />
                  </Box>
                </Zoom>
              </Grid>

              {/* Using StatsCard component for Average Score */}
              <Grid item xs={6} sm={6} md={3}>
                <Zoom in={true} style={{ transitionDelay: '500ms' }}>
                  <Box>
                    <StatsCard
                      title="Average Score"
                      value={loading ? "..." : `${stats.averageScore}%`}
                      icon={<EmojiEvents sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }} />}
                      color={theme.palette.warning.main}
                      tooltip="Your average score across all exams"
                      titleFontSize={{ xs: '0.75rem', sm: '0.875rem', md: '1rem' }}
                      valueFontSize={{ xs: '1.25rem', sm: '1.5rem', md: '2rem' }}
                      iconSize={{ xs: 40, sm: 48, md: 56 }}
                      height={{ xs: '100%', md: '100%' }}
                      padding={{ xs: 1.5, sm: 2, md: 2.5 }}
                    />
                  </Box>
                </Zoom>
              </Grid>
            </Grid>
            </Box>
          </Grid>

          {/* Progress and Achievements Section - Enhanced */}
          <Grid item xs={12}>
            <Box
              sx={{
                mb: { xs: 2, sm: 3 },
                mt: { xs: 3, sm: 4 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 1
              }}
            >
              <Typography
                variant="h5"
                fontWeight="bold"
                sx={{
                  fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
                  display: 'flex',
                  alignItems: 'center',
                  '&::before': {
                    content: '""',
                    display: 'inline-block',
                    width: { xs: 16, sm: 20 },
                    height: { xs: 3, sm: 4 },
                    borderRadius: 4,
                    background: `linear-gradient(90deg, ${theme.palette.success.main}, ${theme.palette.info.main})`,
                    mr: 1.5
                  }
                }}
              >
                Your Progress
              </Typography>
            </Box>
            <Box
              sx={{
                p: { xs: 2, sm: 3 },
                borderRadius: { xs: 2, md: 3 },
                background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.03)} 0%, ${alpha(theme.palette.info.main, 0.03)} 100%)`,
                border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
                mb: { xs: 2, sm: 3 },
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Decorative elements */}
              <Box
                sx={{
                  position: 'absolute',
                  top: -30,
                  right: -30,
                  width: 150,
                  height: 150,
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${alpha(theme.palette.success.main, 0.1)} 0%, transparent 70%)`,
                  display: { xs: 'none', sm: 'block' }
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -20,
                  left: -20,
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${alpha(theme.palette.info.main, 0.1)} 0%, transparent 70%)`,
                  display: { xs: 'none', sm: 'block' }
                }}
              />
              <Grid container spacing={3} sx={{ position: 'relative', zIndex: 1 }}>
              {/* Circular Progress Card */}
              <Grid item xs={12} sm={6} md={4}>
                <Zoom in={true} style={{ transitionDelay: '600ms' }}>
                  <Box>
                    <ProgressCard
                      title="Completion Rate"
                      subtitle="Keep going to improve your rate!"
                      progress={loading ? 0 : stats.completedExams}
                      maxProgress={loading ? 1 : Math.max(stats.totalExams, 1)}
                      color={theme.palette.success.main}
                      type="circular"
                      size="large"
                      showButton={true}
                      buttonText="View All Exams"
                      onClick={() => window.location.href = '/student/exams'}
                    />
                  </Box>
                </Zoom>
              </Grid>

              {/* Study Streak Card */}
              <Grid item xs={12} sm={6} md={4}>
                <Zoom in={true} style={{ transitionDelay: '700ms' }}>
                  <Card elevation={3} sx={{ height: '100%', borderRadius: 0 }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" fontWeight="bold">
                          Study Streak
                        </Typography>
                        <Tooltip title="Days in a row you've studied">
                          <IconButton size="small">
                            <LocalFireDepartment color="error" />
                          </IconButton>
                        </Tooltip>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                        {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                          <Box
                            key={day}
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: 0, // Remove rounded corners
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: day <= studyStreak ? 'error.main' : alpha(theme.palette.error.main, 0.1),
                              color: day <= studyStreak ? 'white' : 'text.secondary',
                              fontWeight: 'bold',
                              boxShadow: day <= studyStreak ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                              transition: 'all 0.3s ease',
                              transform: day === studyStreak ? 'scale(1.2)' : 'scale(1)',
                            }}
                          >
                            {day}
                          </Box>
                        ))}
                      </Box>

                      <Typography variant="body2" color="text.secondary" align="center">
                        {studyStreak === 7 ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                            <Celebration color="error" />
                            <Typography variant="body1" fontWeight="bold" color="error.main">
                              Perfect week! Keep it up!
                            </Typography>
                          </Box>
                        ) : (
                          `You're on a ${studyStreak}-day streak! ${7 - studyStreak} more days for a perfect week.`
                        )}
                      </Typography>
                    </CardContent>
                  </Card>
                </Zoom>
              </Grid>

              {/* Rank Card */}
              <Grid item xs={12} sm={6} md={4}>
                <Zoom in={true} style={{ transitionDelay: '800ms' }}>
                  <Card elevation={3} sx={{ height: '100%', borderRadius: 0 }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h6" fontWeight="bold">
                          Your Rank
                        </Typography>
                        <Tooltip title="Your position on the leaderboard">
                          <IconButton size="small">
                            <LeaderboardIcon color="primary" />
                          </IconButton>
                        </Tooltip>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                        <Avatar
                          sx={{
                            width: 80,
                            height: 80,
                            bgcolor: 'primary.main',
                            fontSize: '2rem',
                            fontWeight: 'bold',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                            border: '4px solid white',
                          }}
                        >
                          #{loading ? "..." : stats.rank}
                        </Avatar>
                      </Box>

                      <Typography variant="body1" align="center" fontWeight="medium">
                        {loading ? "Loading rank..." : `You're in the top ${stats.rank * 10}% of students!`}
                      </Typography>

                      <Box sx={{ mt: 2, textAlign: 'center' }}>
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          startIcon={<AutoGraph />}
                          sx={{ borderRadius: 0 }} // Remove rounded corners
                        >
                          View Leaderboard
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Zoom>
              </Grid>
            </Grid>
            </Box>
          </Grid>

          {/* Achievements Section - Enhanced */}
          <Grid item xs={12}>
            <Box
              sx={{
                mb: { xs: 2, sm: 3 },
                mt: { xs: 3, sm: 4 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 1
              }}
            >
              <Typography
                variant="h5"
                fontWeight="bold"
                sx={{
                  fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
                  display: 'flex',
                  alignItems: 'center',
                  '&::before': {
                    content: '""',
                    display: 'inline-block',
                    width: { xs: 16, sm: 20 },
                    height: { xs: 3, sm: 4 },
                    borderRadius: 4,
                    background: `linear-gradient(90deg, ${theme.palette.warning.main}, ${theme.palette.error.main})`,
                    mr: 1.5
                  }
                }}
              >
                Your Achievements
              </Typography>
            </Box>
            <Box
              sx={{
                p: { xs: 2, sm: 3 },
                borderRadius: { xs: 2, md: 3 },
                background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.03)} 0%, ${alpha(theme.palette.error.main, 0.03)} 100%)`,
                border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`,
                mb: { xs: 2, sm: 3 },
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Decorative elements */}
              <Box
                sx={{
                  position: 'absolute',
                  top: -30,
                  right: -30,
                  width: 150,
                  height: 150,
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${alpha(theme.palette.warning.main, 0.1)} 0%, transparent 70%)`,
                  display: { xs: 'none', sm: 'block' }
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -20,
                  left: -20,
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${alpha(theme.palette.error.main, 0.1)} 0%, transparent 70%)`,
                  display: { xs: 'none', sm: 'block' }
                }}
              />
              <Grid container spacing={3} sx={{ position: 'relative', zIndex: 1 }}>
              {loading ? (
                Array.from(new Array(4)).map((_, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <Skeleton variant="rounded" height={180} sx={{ borderRadius: 0 }} />
                  </Grid>
                ))
              ) : (
                achievements.map((achievement, index) => (
                  <Grid item xs={12} sm={6} md={3} key={achievement.id}>
                    <Zoom in={true} style={{ transitionDelay: `${900 + (index * 100)}ms` }}>
                      <Box>
                        <AchievementCard
                          title={achievement.title}
                          description={achievement.description}
                          progress={achievement.progress}
                          maxProgress={achievement.maxProgress}
                          level={achievement.level}
                          type={achievement.type}
                          icon={achievement.icon}
                          unlocked={achievement.unlocked}
                        />
                      </Box>
                    </Zoom>
                  </Grid>
                ))
              )}
            </Grid>
            </Box>
          </Grid>

          {/* Leaderboard and Recent Exams Section - Enhanced */}
          <Grid item xs={12}>
            <Box
              sx={{
                mb: { xs: 2, sm: 3 },
                mt: { xs: 3, sm: 4 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 1
              }}
            >
              <Typography
                variant="h5"
                fontWeight="bold"
                sx={{
                  fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
                  display: 'flex',
                  alignItems: 'center',
                  '&::before': {
                    content: '""',
                    display: 'inline-block',
                    width: { xs: 16, sm: 20 },
                    height: { xs: 3, sm: 4 },
                    borderRadius: 4,
                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.info.main})`,
                    mr: 1.5
                  }
                }}
              >
                Activity & Leaderboard
              </Typography>
            </Box>
            <Grid container spacing={3}>
              {/* Leaderboard */}
              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    p: { xs: 2, sm: 2.5 },
                    borderRadius: { xs: 2, md: 3 },
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.03)} 0%, ${alpha(theme.palette.info.main, 0.03)} 100%)`,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                    mb: { xs: 2, sm: 3 },
                    height: '100%',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    sx={{
                      mb: 2,
                      fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
                      color: theme.palette.primary.main
                    }}
                  >
                    Leaderboard
                  </Typography>
                <Zoom in={true} style={{ transitionDelay: '1200ms' }}>
                  <Box>
                    <Leaderboard
                      title={leaderboardData.length > 0 ? "Class Leaderboard" : "No Classmates Found"}
                      subtitle={leaderboardData.length > 0 ?
                        leaderboardData[0]?.studentClass ?
                          `${leaderboardData[0].studentClass} - Based on exam performance` :
                          "Based on exam performance" :
                        "Complete exams to appear on the leaderboard"}
                      data={leaderboardData}
                      maxItems={5}
                      showViewAll={leaderboardData.length > 5}
                      onViewAll={() => {}}
                      highlightCurrentUser={true}
                      currentUserId={user?._id}
                      type="score"
                      emptyMessage="No students in your class have completed exams yet"
                    />
                  </Box>
                </Zoom>
                </Box>
              </Grid>

              {/* Recent Exams */}
              <Grid item xs={12} md={8}>
                <Box
                  sx={{
                    p: { xs: 3, sm: 3.5 },
                    borderRadius: { xs: 3, md: 4 },
                    background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.05)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`,
                    border: `1px solid ${alpha(theme.palette.info.main, 0.15)}`,
                    mb: { xs: 2, sm: 3 },
                    height: '100%',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: `0 10px 30px ${alpha(theme.palette.info.main, 0.1)}`
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -50,
                      right: -50,
                      width: 200,
                      height: 200,
                      borderRadius: '50%',
                      background: `radial-gradient(circle, ${alpha(theme.palette.info.main, 0.1)} 0%, transparent 70%)`,
                      zIndex: 0
                    }}
                  />

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, position: 'relative', zIndex: 1 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.info.dark} 100%)`,
                        boxShadow: `0 4px 12px ${alpha(theme.palette.info.main, 0.3)}`,
                        mr: 2
                      }}
                    >
                      <Assessment sx={{ color: 'white' }} />
                    </Box>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      sx={{
                        fontSize: { xs: '1.1rem', sm: '1.2rem', md: '1.35rem' },
                        color: theme.palette.info.main,
                        position: 'relative',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          bottom: -5,
                          left: 0,
                          width: '40%',
                          height: 2,
                          backgroundColor: theme.palette.info.main,
                          borderRadius: 1
                        }
                      }}
                    >
                      Recent Exams
                    </Typography>
                  </Box>
                <Zoom in={true} style={{ transitionDelay: '1300ms' }}>
                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: { xs: 2, md: 3 },
                      overflow: 'hidden',
                      position: 'relative',
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: `0 8px 25px ${alpha(theme.palette.info.main, 0.15)}`,
                        transform: 'translateY(-5px)'
                      }
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '6px',
                        background: `linear-gradient(90deg, ${theme.palette.info.main}, ${theme.palette.success.main})`,
                      }}
                    />
                    <CardContent sx={{ pt: 4 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar
                            sx={{
                              bgcolor: 'primary.main',
                              mr: 2,
                              width: 45,
                              height: 45,
                              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
                            }}
                          >
                            <School />
                          </Avatar>
                          <Typography variant="h5" component="h2" fontWeight="bold">
                            Recent Exams
                          </Typography>
                        </Box>
                        <Tooltip title="Refresh exams">
                          <IconButton
                            color="primary"
                            sx={{
                              bgcolor: 'primary.lighter',
                              '&:hover': { bgcolor: 'primary.light', color: 'white' }
                            }}
                          >
                            <Refresh />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      <Divider sx={{ mb: 3 }} />

                      {loading ? (
                        <Box sx={{ py: 2 }}>
                          <Grid container spacing={3}>
                            {[1, 2, 3].map((item) => (
                              <Grid item xs={12} md={4} key={item}>
                                <Card variant="outlined" sx={{ height: '100%', p: 2, borderRadius: 0 }}>
                                  <Skeleton variant="rectangular" height={30} width="80%" sx={{ mb: 1 }} />
                                  <Skeleton variant="rectangular" height={20} width="40%" sx={{ mb: 2 }} />
                                  <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
                                  <Skeleton variant="rectangular" height={20} width="60%" sx={{ mb: 2 }} />
                                  <Skeleton variant="rectangular" height={36} width="100%" />
                                </Card>
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      ) : recentExams.length > 0 ? (
                        <Grid container spacing={3}>
                          {recentExams.map((exam) => (
                            <Grid item xs={12} md={4} key={exam._id}>
                              <Card
                                elevation={3}
                                sx={{
                                  height: '100%',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  borderRadius: { xs: 3, md: 4 },
                                  transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                  position: 'relative',
                                  overflow: 'hidden',
                                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.default, 0.95)} 100%)`,
                                  backdropFilter: 'blur(10px)',
                                  boxShadow: `0 10px 20px ${alpha(
                                    exam.status === 'completed'
                                      ? theme.palette.success.main
                                      : exam.status === 'in-progress'
                                        ? theme.palette.warning.main
                                        : theme.palette.primary.main,
                                    0.1
                                  )}`,
                                  '&:hover': {
                                    transform: 'translateY(-12px) scale(1.02)',
                                    boxShadow: `0 20px 40px ${alpha(
                                      exam.status === 'completed'
                                        ? theme.palette.success.main
                                        : exam.status === 'in-progress'
                                          ? theme.palette.warning.main
                                          : theme.palette.primary.main,
                                      0.2
                                    )}`,
                                  }
                                }}
                              >
                                <Box
                                  sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '8px',
                                    background: exam.status === 'completed'
                                      ? `linear-gradient(90deg, ${theme.palette.success.light}, ${theme.palette.success.main})`
                                      : exam.status === 'in-progress'
                                        ? `linear-gradient(90deg, ${theme.palette.warning.light}, ${theme.palette.warning.main})`
                                        : `linear-gradient(90deg, ${theme.palette.info.light}, ${theme.palette.info.main})`,
                                    boxShadow: `0 2px 6px ${alpha(
                                      exam.status === 'completed'
                                        ? theme.palette.success.main
                                        : exam.status === 'in-progress'
                                          ? theme.palette.warning.main
                                          : theme.palette.info.main,
                                      0.4
                                    )}`,
                                    zIndex: 2
                                  }}
                                />

                                <Box sx={{ position: 'relative' }}>
                                  <CardMedia
                                    component="img"
                                    height="140"
                                    image={`https://source.unsplash.com/random/300x200/?exam,education,${exam.title.split(' ')[0]}`}
                                    alt={exam.title}
                                    sx={{
                                      objectFit: 'cover',
                                      objectPosition: 'center',
                                      transition: 'all 0.5s ease',
                                      filter: 'brightness(0.85)',
                                      '&:hover': {
                                        filter: 'brightness(1)',
                                        transform: 'scale(1.05)'
                                      }
                                    }}
                                  />

                                  <Box
                                    sx={{
                                      position: 'absolute',
                                      top: 0,
                                      left: 0,
                                      width: '100%',
                                      height: '100%',
                                      background: `linear-gradient(to bottom, transparent 50%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
                                      zIndex: 1
                                    }}
                                  />

                                  <Chip
                                    icon={getStatusIcon(exam.status)}
                                    label={exam.status.replace('-', ' ')}
                                    color={getStatusColor(exam.status)}
                                    size="small"
                                    sx={{
                                      position: 'absolute',
                                      top: 12,
                                      right: 12,
                                      textTransform: 'capitalize',
                                      fontWeight: 'bold',
                                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                      zIndex: 2,
                                      '& .MuiChip-icon': {
                                        color: 'inherit'
                                      }
                                    }}
                                  />
                                </Box>

                                <CardContent sx={{ flexGrow: 1, pt: 3, pb: 2, px: 3 }}>
                                  <Typography
                                    variant="h6"
                                    component="h3"
                                    fontWeight="bold"
                                    sx={{
                                      display: '-webkit-box',
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: 'vertical',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      lineHeight: 1.3,
                                      height: '2.6em',
                                      fontSize: { xs: '1.1rem', sm: '1.2rem', md: '1.25rem' },
                                      color: theme.palette.text.primary,
                                      mb: 1.5,
                                      position: 'relative',
                                      pl: 1,
                                      '&::before': {
                                        content: '""',
                                        position: 'absolute',
                                        left: -4,
                                        top: 0,
                                        height: '100%',
                                        width: 4,
                                        borderRadius: 4,
                                        backgroundColor: exam.status === 'completed'
                                          ? theme.palette.success.main
                                          : exam.status === 'in-progress'
                                            ? theme.palette.warning.main
                                            : theme.palette.primary.main,
                                      }
                                    }}
                                  >
                                    {exam.title}
                                  </Typography>

                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                      mb: 2.5,
                                      display: '-webkit-box',
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: 'vertical',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      height: '3em',
                                      fontSize: { xs: '0.85rem', sm: '0.9rem' },
                                      lineHeight: 1.5,
                                      opacity: 0.85
                                    }}
                                  >
                                    {exam.description || 'No description available for this exam.'}
                                  </Typography>

                                  <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    flexWrap: 'wrap',
                                    mb: 2
                                  }}>
                                    <Chip
                                      icon={<AccessTime fontSize="small" />}
                                      label={`${exam.timeLimit} min`}
                                      size="small"
                                      variant="outlined"
                                      color={
                                        exam.status === 'completed'
                                          ? 'success'
                                          : exam.status === 'in-progress'
                                            ? 'warning'
                                            : 'primary'
                                      }
                                      sx={{
                                        borderRadius: 6,
                                        fontWeight: 'medium',
                                        '& .MuiChip-icon': {
                                          color: 'inherit'
                                        }
                                      }}
                                    />

                                    {exam.questions && (
                                      <Chip
                                        icon={<Assessment fontSize="small" />}
                                        label={`${exam.questions.length} Questions`}
                                        size="small"
                                        variant="outlined"
                                        color="info"
                                        sx={{
                                          borderRadius: 6,
                                          fontWeight: 'medium',
                                          '& .MuiChip-icon': {
                                            color: 'inherit'
                                          }
                                        }}
                                      />
                                    )}
                                  </Box>
                                </CardContent>

                                <Box sx={{ p: 2, pt: 0, px: 3 }}>
                                  <Button
                                    variant="contained"
                                    color={
                                      exam.status === 'completed'
                                        ? 'success'
                                        : exam.status === 'in-progress'
                                          ? 'warning'
                                          : 'primary'
                                    }
                                    component={RouterLink}
                                    to={exam.status === 'completed'
                                      ? `/student/results/${exam._id}`
                                      : `/student/exam/${exam._id}`}
                                    endIcon={<ArrowForward />}
                                    fullWidth
                                    sx={{
                                      borderRadius: 8,
                                      py: { xs: 1.25, md: 1.5 },
                                      fontWeight: 'bold',
                                      position: 'relative',
                                      overflow: 'hidden',
                                      boxShadow: `0 8px 16px ${alpha(
                                        exam.status === 'completed'
                                          ? theme.palette.success.main
                                          : exam.status === 'in-progress'
                                            ? theme.palette.warning.main
                                            : theme.palette.primary.main,
                                        0.25
                                      )}`,
                                      background: exam.status === 'completed'
                                        ? `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`
                                        : exam.status === 'in-progress'
                                          ? `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`
                                          : `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                                      transition: 'all 0.3s ease',
                                      textTransform: 'none',
                                      fontSize: { xs: '0.9rem', sm: '1rem' },
                                      letterSpacing: 0.5,
                                      '&:hover': {
                                        transform: 'translateY(-3px)',
                                        boxShadow: `0 12px 20px ${alpha(
                                          exam.status === 'completed'
                                            ? theme.palette.success.main
                                            : exam.status === 'in-progress'
                                              ? theme.palette.warning.main
                                              : theme.palette.primary.main,
                                          0.4
                                        )}`,
                                      },
                                      '&::after': {
                                        content: '""',
                                        position: 'absolute',
                                        top: 0,
                                        left: '-100%',
                                        width: '100%',
                                        height: '100%',
                                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                                        transition: 'all 0.8s ease',
                                      },
                                      '&:hover::after': {
                                        left: '100%',
                                      }
                                    }}
                                  >
                                    {exam.status === 'in-progress'
                                      ? 'Continue Exam'
                                      : exam.status === 'completed'
                                        ? 'View Results'
                                        : 'Start Exam'}
                                  </Button>
                                </Box>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      ) : (
                        <Paper
                          elevation={0}
                          sx={{
                            py: 6,
                            px: 4,
                            textAlign: 'center',
                            bgcolor: 'background.default',
                            borderRadius: 3,
                          }}
                        >
                          <Box
                            component="img"
                            src="https://img.freepik.com/free-vector/no-data-concept-illustration_114360-536.jpg"
                            alt="No exams available"
                            sx={{
                              width: '100%',
                              maxWidth: 200,
                              height: 'auto',
                              mb: 2,
                              opacity: 0.8
                            }}
                          />
                          <Typography variant="h6" color="text.secondary" gutterBottom>
                            No exams available at the moment
                          </Typography>
                          <Typography variant="body2" color="text.secondary" paragraph>
                            Check back later or contact your administrator for more information.
                          </Typography>
                          <Button
                            variant="contained"
                            color="primary"
                            component={RouterLink}
                            to="/student/exams"
                            sx={{ mt: 2 }}
                          >
                            Browse All Exams
                          </Button>
                        </Paper>
                      )}
                    </CardContent>

                    {recentExams.length > 0 && (
                      <Box sx={{ p: 2, bgcolor: 'background.default', borderTop: '1px solid', borderColor: 'divider' }}>
                        <Button
                          component={RouterLink}
                          to="/student/exams"
                          color="primary"
                          endIcon={<ArrowForward />}
                          sx={{ fontWeight: 'medium' }}
                        >
                          View All Exams
                        </Button>
                      </Box>
                    )}
                  </Card>
                </Zoom>
                </Box>
              </Grid>
            </Grid>
          </Grid>
          </Grid>
        </Grow>
      </Container>
    </StudentLayout>
  );
};

export default Dashboard;
