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
  CardMedia,
  Divider,
  Avatar,
  Chip,
  LinearProgress,
  CircularProgress,
  Grow,
  Zoom,
  Fade,
  Badge,
  IconButton,
  Tooltip,
  Skeleton,
  Stack,
  useTheme,
  alpha
} from '@mui/material';
import {
  School,
  AssignmentTurnedIn,
  EmojiEvents,
  Timeline,
  Notifications,
  ArrowForward,
  CheckCircle,
  AccessTime,
  PlayArrow,
  CalendarToday,
  TrendingUp,
  Refresh,
  Star,
  StarBorder,
  StarHalf,
  Whatshot,
  Bolt,
  LocalFireDepartment,
  Lightbulb,
  Celebration,
  WorkspacePremium,
  Insights,
  Psychology,
  AutoGraph,
  Leaderboard as LeaderboardIcon,
  Assessment
} from '@mui/icons-material';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
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
  const [studyStreak, setStudyStreak] = useState(5); // Days in a row

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

        // Mock leaderboard data
        setLeaderboardData([
          { id: 1, name: 'Alex Johnson', score: 1250, avatar: '' },
          { id: 2, name: 'Maria Garcia', score: 980, avatar: '' },
          { id: user?.id || 3, name: user?.firstName ? `${user.firstName} ${user.lastName}` : 'You', score: totalPoints, avatar: '', isCurrentUser: true },
          { id: 4, name: 'James Wilson', score: 720, avatar: '' },
          { id: 5, name: 'Sarah Brown', score: 650, avatar: '' }
        ].sort((a, b) => b.score - a.score));

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

  // Function to render rating stars based on score
  const renderRatingStars = (score) => {
    const maxStars = 5;
    const starCount = (score / 100) * maxStars;
    const fullStars = Math.floor(starCount);
    const hasHalfStar = starCount - fullStars >= 0.5;

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
        {[...Array(maxStars)].map((_, index) => {
          if (index < fullStars) {
            return <Star key={index} sx={{ color: 'secondary.main' }} />;
          } else if (index === fullStars && hasHalfStar) {
            return <StarHalf key={index} sx={{ color: 'secondary.main' }} />;
          } else {
            return <StarBorder key={index} sx={{ color: 'secondary.main' }} />;
          }
        })}
        <Typography variant="body2" sx={{ ml: 1, color: 'text.secondary' }}>
          {score}%
        </Typography>
      </Box>
    );
  };

  // Function to get a motivational message based on score
  const getMotivationalMessage = (score) => {
    if (score >= 90) return "Excellent work! Keep up the outstanding performance!";
    if (score >= 80) return "Great job! You're doing very well!";
    if (score >= 70) return "Good progress! Keep pushing yourself!";
    if (score >= 60) return "You're on the right track. Keep studying!";
    return "Keep practicing and you'll improve!";
  };

  // Get current date
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <StudentLayout>
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        {/* Welcome Section */}
        <Grow in={true} timeout={800}>
          <Grid container spacing={4}>
          {/* Welcome Card with Level Progress */}
          <Grid item xs={12}>
            <Paper
              elevation={3}
              sx={{
                p: { xs: 3, md: 4 },
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: 'center',
                justifyContent: 'space-between',
                borderRadius: 0, // Remove rounded corners
                background: 'linear-gradient(135deg, #4a148c 0%, #7c43bd 100%)',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Decorative elements */}
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
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: '120px',
                  height: '120px',
                  background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                  borderRadius: '50%',
                  transform: 'translate(-30%, 30%)',
                }}
              />

              <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 3, md: 0 }, width: { xs: '100%', md: 'auto' } }}>
                <Box sx={{ position: 'relative', mr: 3 }}>
                  <Avatar
                    sx={{
                      bgcolor: 'secondary.main',
                      width: { xs: 70, md: 80 },
                      height: { xs: 70, md: 80 },
                      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
                      border: '3px solid rgba(255,255,255,0.2)',
                    }}
                  >
                    {user?.firstName?.charAt(0).toUpperCase() || 'S'}
                  </Avatar>
                  <Tooltip title="Your current level">
                    <Avatar
                      sx={{
                        position: 'absolute',
                        bottom: -10,
                        right: -10,
                        width: 36,
                        height: 36,
                        bgcolor: 'secondary.main',
                        color: 'white',
                        border: '2px solid white',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                        fontSize: '0.875rem',
                        fontWeight: 'bold'
                      }}
                    >
                      {loading ? '...' : stats.level}
                    </Avatar>
                  </Tooltip>
                </Box>
                <Box>
                  <Typography
                    variant="h3"
                    component="h1"
                    fontWeight="bold"
                    sx={{
                      fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' },
                      textShadow: '0 2px 10px rgba(0,0,0,0.3)'
                    }}
                  >
                    Welcome, {user?.firstName || 'Student'}!
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Chip
                      icon={<WorkspacePremium sx={{ color: 'white !important' }} />}
                      label={`${loading ? '...' : stats.totalPoints} XP`}
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        mr: 1,
                        borderRadius: 0, // Remove rounded corners
                        '& .MuiChip-label': { fontWeight: 'medium' }
                      }}
                    />
                    <Chip
                      icon={<LocalFireDepartment sx={{ color: 'white !important' }} />}
                      label={`${loading ? '...' : stats.streak} Day Streak`}
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        mr: 1,
                        borderRadius: 0, // Remove rounded corners
                        '& .MuiChip-label': { fontWeight: 'medium' }
                      }}
                    />
                    <Chip
                      icon={<CalendarToday sx={{ color: 'white !important' }} />}
                      label={currentDate}
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        borderRadius: 0, // Remove rounded corners
                        '& .MuiChip-label': { fontWeight: 'medium' }
                      }}
                    />
                  </Box>

                  {/* Level Progress Bar */}
                  <Box sx={{ mt: 2, width: '100%', maxWidth: 300 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" fontWeight="medium">
                        Level {loading ? '...' : stats.level}
                      </Typography>
                      <Typography variant="caption" fontWeight="medium">
                        {loading ? '...' : stats.xp}/{loading ? '...' : stats.nextLevelXp} XP
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={loading ? 0 : (stats.xp / stats.nextLevelXp) * 100}
                      sx={{
                        height: 8,
                        borderRadius: 0, // Remove rounded corners
                        bgcolor: 'rgba(255,255,255,0.2)',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: 'secondary.main',
                          borderRadius: 0 // Remove rounded corners
                        }
                      }}
                    />
                  </Box>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Tooltip title={`${stats.availableExams} exams available`}>
                  <Badge
                    badgeContent={stats.availableExams}
                    color="secondary"
                    overlap="circular"
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                  >
                    <Button
                      variant="contained"
                      color="secondary"
                      component={RouterLink}
                      to="/student/exams"
                      endIcon={<ArrowForward />}
                      sx={{
                        fontWeight: 'bold',
                        color: 'black',
                        px: 3,
                        py: 1.2,
                        borderRadius: 0, // Remove rounded corners
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
                  endIcon={<Assessment />}
                  sx={{
                    fontWeight: 'medium',
                    color: 'white',
                    borderColor: 'rgba(255,255,255,0.5)',
                    borderRadius: 0, // Remove rounded corners
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

          {/* Stats Cards */}
          <Grid item xs={12}>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
              Your Dashboard
            </Typography>
            <Grid container spacing={3}>
              {/* Using StatsCard component for Total Exams */}
              <Grid item xs={12} sm={6} md={3}>
                <Zoom in={true} style={{ transitionDelay: '200ms' }}>
                  <Box>
                    <StatsCard
                      title="Total Exams"
                      value={loading ? "..." : stats.totalExams}
                      icon={<School fontSize="large" />}
                      color={theme.palette.primary.main}
                      tooltip="Total number of exams assigned to you"
                    />
                  </Box>
                </Zoom>
              </Grid>

              {/* Using StatsCard component for Completed Exams */}
              <Grid item xs={12} sm={6} md={3}>
                <Zoom in={true} style={{ transitionDelay: '300ms' }}>
                  <Box>
                    <StatsCard
                      title="Completed Exams"
                      value={loading ? "..." : stats.completedExams}
                      icon={<AssignmentTurnedIn fontSize="large" />}
                      color={theme.palette.success.main}
                      trend={loading ? null : stats.completedExams > 0 ? 10 : 0}
                      trendLabel="vs last week"
                      tooltip="Number of exams you have completed"
                    />
                  </Box>
                </Zoom>
              </Grid>

              {/* Using StatsCard component for Available Exams */}
              <Grid item xs={12} sm={6} md={3}>
                <Zoom in={true} style={{ transitionDelay: '400ms' }}>
                  <Box>
                    <StatsCard
                      title="Available Exams"
                      value={loading ? "..." : stats.availableExams}
                      icon={<PlayArrow fontSize="large" />}
                      color={theme.palette.info.main}
                      tooltip="Number of exams available to take"
                    />
                  </Box>
                </Zoom>
              </Grid>

              {/* Using StatsCard component for Average Score */}
              <Grid item xs={12} sm={6} md={3}>
                <Zoom in={true} style={{ transitionDelay: '500ms' }}>
                  <Box>
                    <StatsCard
                      title="Average Score"
                      value={loading ? "..." : `${stats.averageScore}%`}
                      icon={<EmojiEvents fontSize="large" />}
                      color={theme.palette.warning.main}
                      tooltip="Your average score across all exams"
                    />
                  </Box>
                </Zoom>
              </Grid>
            </Grid>
          </Grid>

          {/* Progress and Achievements Section */}
          <Grid item xs={12}>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 2, mt: 2 }}>
              Your Progress
            </Typography>
            <Grid container spacing={3}>
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
          </Grid>

          {/* Achievements Section */}
          <Grid item xs={12}>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 2, mt: 3 }}>
              Your Achievements
            </Typography>
            <Grid container spacing={3}>
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
          </Grid>

          {/* Leaderboard and Recent Exams Section */}
          <Grid item xs={12}>
            <Grid container spacing={3}>
              {/* Leaderboard */}
              <Grid item xs={12} md={4}>
                <Typography variant="h5" fontWeight="bold" sx={{ mb: 2, mt: 3 }}>
                  Leaderboard
                </Typography>
                <Zoom in={true} style={{ transitionDelay: '1200ms' }}>
                  <Box>
                    <Leaderboard
                      title="Top Students"
                      data={leaderboardData}
                      maxItems={5}
                      showViewAll={true}
                      onViewAll={() => {}}
                      highlightCurrentUser={true}
                      currentUserId={user?.id || 3}
                      type="score"
                    />
                  </Box>
                </Zoom>
              </Grid>

              {/* Recent Exams */}
              <Grid item xs={12} md={8}>
                <Typography variant="h5" fontWeight="bold" sx={{ mb: 2, mt: 3 }}>
                  Recent Exams
                </Typography>
                <Zoom in={true} style={{ transitionDelay: '1300ms' }}>
              <Card
                elevation={3}
                sx={{
                  borderRadius: 0, // Remove rounded corners
                  overflow: 'hidden',
                  position: 'relative'
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '8px',
                    background: 'linear-gradient(90deg, #4a148c, #7c43bd)',
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
                            elevation={2}
                            sx={{
                              height: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                              borderRadius: 0, // Remove rounded corners
                              transition: 'all 0.3s ease',
                              position: 'relative',
                              overflow: 'hidden',
                              '&:hover': {
                                transform: 'translateY(-8px)',
                                boxShadow: '0 12px 20px rgba(0, 0, 0, 0.2)',
                              }
                            }}
                          >
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '5px',
                                bgcolor: exam.status === 'completed'
                                  ? 'success.main'
                                  : exam.status === 'in-progress'
                                    ? 'warning.main'
                                    : 'info.main',
                              }}
                            />

                            <CardMedia
                              component="img"
                              height="120"
                              image={`https://source.unsplash.com/random/300x200/?exam,education,${exam.title.split(' ')[0]}`}
                              alt={exam.title}
                              sx={{
                                objectFit: 'cover',
                                objectPosition: 'center',
                              }}
                            />

                            <CardContent sx={{ flexGrow: 1, pt: 2 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
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
                                    lineHeight: 1.2,
                                    height: '2.4em',
                                  }}
                                >
                                  {exam.title}
                                </Typography>
                                <Chip
                                  icon={getStatusIcon(exam.status)}
                                  label={exam.status.replace('-', ' ')}
                                  color={getStatusColor(exam.status)}
                                  size="small"
                                  sx={{
                                    textTransform: 'capitalize',
                                    ml: 1,
                                    flexShrink: 0,
                                  }}
                                />
                              </Box>

                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                  mb: 2,
                                  display: '-webkit-box',
                                  WebkitLineClamp: 3,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  height: '4.5em',
                                }}
                              >
                                {exam.description || 'No description available for this exam.'}
                              </Typography>

                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                                <Chip
                                  icon={<AccessTime fontSize="small" />}
                                  label={`${exam.timeLimit} min`}
                                  size="small"
                                  variant="outlined"
                                  color="primary"
                                />

                                {exam.status === 'in-progress' && (
                                  <Chip
                                    label="In Progress"
                                    size="small"
                                    color="warning"
                                  />
                                )}
                              </Box>
                            </CardContent>

                            <Divider />

                            <CardActions sx={{ p: 2 }}>
                              <Button
                                variant={exam.status === 'in-progress' ? 'contained' : 'outlined'}
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
                                  borderRadius: 2,
                                  py: 1,
                                  position: 'relative',
                                  overflow: 'hidden',
                                  '&::after': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: '-100%',
                                    width: '100%',
                                    height: '100%',
                                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                                    transition: 'all 0.5s',
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
                            </CardActions>
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
