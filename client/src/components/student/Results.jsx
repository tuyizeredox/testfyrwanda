import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Tabs,
  Tab,
  Grow,
  Zoom,
  Fade,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  ExpandMore,
  CheckCircle,
  Cancel,
  ArrowBack,
  EmojiEvents,
  Timeline,
  School,
  AccessTime,
  Refresh,
  Search,
  FilterList,
  Sort,
  Info,
  Star,
  StarBorder
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import api from '../../services/api';
import StudentLayout from './StudentLayout';

// Styled components
const ScoreCircle = styled(Box)(({ theme, score }) => {
  let color = theme.palette.error.main;
  if (score >= 80) {
    color = theme.palette.success.main;
  } else if (score >= 60) {
    color = theme.palette.warning.main;
  } else if (score >= 40) {
    color = theme.palette.info.main;
  }

  return {
    position: 'relative',
    width: 120,
    height: 120,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '50%',
    background: `conic-gradient(${color} ${score}%, #e0e0e0 0)`,
    '&::before': {
      content: '""',
      position: 'absolute',
      width: 100,
      height: 100,
      borderRadius: '50%',
      background: theme.palette.background.paper,
    }
  };
});

const GradeBadge = styled(Box)(({ theme, score }) => {
  let color = theme.palette.error.main;
  let grade = 'F';

  if (score >= 90) {
    color = theme.palette.success.dark;
    grade = 'A+';
  } else if (score >= 80) {
    color = theme.palette.success.main;
    grade = 'A';
  } else if (score >= 70) {
    color = theme.palette.success.light;
    grade = 'B';
  } else if (score >= 60) {
    color = theme.palette.warning.main;
    grade = 'C';
  } else if (score >= 50) {
    color = theme.palette.warning.light;
    grade = 'D';
  }

  return {
    width: 60,
    height: 60,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '50%',
    background: color,
    color: 'white',
    fontWeight: 'bold',
    fontSize: '1.5rem',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
    border: '3px solid white',
    grade
  };
});

const Results = () => {
  const { resultId } = useParams();
  const navigate = useNavigate();

  const [results, setResults] = useState([]);
  const [detailedResult, setDetailedResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        setError(null);

        // Removed the duplicate /api prefix
        const res = await api.get('/student/results');
        setResults(res.data);

        // If resultId is provided, fetch detailed result
        if (resultId) {
          await fetchDetailedResult(resultId);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching results:', err);
        setError('Failed to load results. Please try again later.');
        setLoading(false);
      }
    };

    fetchResults();
  }, [resultId]);

  const fetchDetailedResult = async (id) => {
    try {
      setDetailLoading(true);
      console.log('Fetching detailed result for ID:', id);

      // Removed the duplicate /api prefix
      const res = await api.get(`/student/results/${id}`);
      console.log('Detailed result data received:', res.data);

      if (!res.data) {
        throw new Error('No data received from server');
      }

      setDetailedResult(res.data);
      setTabValue(0); // Reset tab when loading new result
      setDetailLoading(false);
    } catch (err) {
      console.error('Error fetching detailed result:', err);
      console.error('Error details:', err.response?.data || err.message);
      setError('Failed to load detailed result. Please try again later.');
      setDetailLoading(false);

      // Navigate back to results list after a delay if there's an error
      setTimeout(() => {
        navigate('/student/results');
      }, 3000);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Format date
  const formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Calculate percentage
  const calculatePercentage = (score, maxScore) => {
    // Handle edge cases to prevent NaN
    if (!score || !maxScore || maxScore === 0) {
      return 0;
    }
    return Math.round((score / maxScore) * 100);
  };

  if (loading) {
    return (
      <StudentLayout>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading results...
          </Typography>
        </Container>
      </StudentLayout>
    );
  }

  if (error) {
    return (
      <StudentLayout>
        <Container maxWidth="md">
          <Alert
            severity="error"
            sx={{ mb: 4 }}
            action={
              <Button color="inherit" size="small" onClick={() => navigate('/student')}>
                Back to Dashboard
              </Button>
            }
          >
            {error}
          </Alert>
        </Container>
      </StudentLayout>
    );
  }

  // If resultId is provided, show detailed result
  if (resultId && detailedResult) {
    const percentage = calculatePercentage(detailedResult.totalScore, detailedResult.maxPossibleScore);

    // Group answers by section
    const sectionAnswers = {};
    detailedResult.answers.forEach(answer => {
      const section = answer.question.section;
      if (!sectionAnswers[section]) {
        sectionAnswers[section] = [];
      }
      sectionAnswers[section].push(answer);
    });

    return (
      <StudentLayout>
        <Container maxWidth="lg" sx={{ mb: 8 }}>
          <Grow in={true} timeout={800}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              mb: 4,
              borderRadius: 4,
              background: 'linear-gradient(135deg, #4a148c 0%, #7c43bd 100%)',
              color: 'white',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                  {detailedResult.exam.title}
                </Typography>
                <Typography variant="subtitle1">
                  Completed on {formatDate(detailedResult.endTime)}
                </Typography>
              </Box>

              <Button
                variant="contained"
                color="secondary"
                onClick={() => navigate('/student/results')}
                startIcon={<ArrowBack />}
                sx={{ color: 'black', fontWeight: 'bold' }}
              >
                Back to Results
              </Button>
            </Box>
          </Paper>
        </Grow>

        <Grid container spacing={4}>
          {/* Score Summary */}
          <Grid item xs={12} md={4}>
            <Zoom in={true} style={{ transitionDelay: '200ms' }}>
              <Card elevation={3} sx={{ height: '100%' }}>
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom>
                    Your Score
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'center', my: 4, position: 'relative' }}>
                    <ScoreCircle score={percentage}>
                      <Box sx={{ position: 'relative', textAlign: 'center' }}>
                        <Typography variant="h4" component="div" fontWeight="bold">
                          {percentage}%
                        </Typography>
                      </Box>
                    </ScoreCircle>

                    <Box sx={{ position: 'absolute', bottom: -10, right: '30%' }}>
                      <GradeBadge score={percentage} />
                    </Box>
                  </Box>

                  <Typography variant="h6" gutterBottom>
                    {detailedResult.totalScore} / {detailedResult.maxPossibleScore} points
                  </Typography>

                  <Divider sx={{ my: 3 }} />

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Start Time
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {formatDate(detailedResult.startTime)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        End Time
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {formatDate(detailedResult.endTime)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Time Taken
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {Math.round((new Date(detailedResult.endTime) - new Date(detailedResult.startTime)) / 60000)} minutes
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Zoom>
          </Grid>

          {/* Detailed Results */}
          <Grid item xs={12} md={8}>
            <Zoom in={true} style={{ transitionDelay: '400ms' }}>
              <Card elevation={3}>
                <CardContent sx={{ p: 0 }}>
                  <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs
                      value={tabValue}
                      onChange={handleTabChange}
                      indicatorColor="primary"
                      textColor="primary"
                      variant="fullWidth"
                    >
                      <Tab label="Section A" />
                      <Tab label="Section B" />
                      <Tab label="Section C" />
                    </Tabs>
                  </Box>

                  {['A', 'B', 'C'].map((section, index) => (
                    <Box
                      key={section}
                      role="tabpanel"
                      hidden={tabValue !== index}
                      id={`section-tabpanel-${index}`}
                      aria-labelledby={`section-tab-${index}`}
                      sx={{ p: 3 }}
                    >
                      {tabValue === index && (
                        <>
                          <Typography variant="h6" fontWeight="bold" gutterBottom>
                            Section {section} Questions
                          </Typography>

                          {sectionAnswers[section] && sectionAnswers[section].length > 0 ? (
                            sectionAnswers[section].map((answer, answerIndex) => (
                              <Accordion
                                key={answer._id}
                                elevation={1}
                                sx={{
                                  mb: 2,
                                  borderLeft: '4px solid',
                                  borderColor: answer.isCorrect ? 'success.main' : 'error.main',
                                  '&:before': { display: 'none' }
                                }}
                              >
                                <AccordionSummary
                                  expandIcon={<ExpandMore />}
                                  aria-controls={`panel${answerIndex}-content`}
                                  id={`panel${answerIndex}-header`}
                                >
                                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                                    <Typography fontWeight="medium">
                                      Question {answerIndex + 1}: {answer.question.text.substring(0, 50)}
                                      {answer.question.text.length > 50 ? '...' : ''}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                                      <Chip
                                        icon={answer.isCorrect ? <CheckCircle /> : <Cancel />}
                                        label={`${answer.score}/${answer.question.points} pts`}
                                        color={answer.isCorrect ? 'success' : 'error'}
                                        size="small"
                                        sx={{ ml: 1 }}
                                      />
                                    </Box>
                                  </Box>
                                </AccordionSummary>
                                <AccordionDetails>
                                  <Typography variant="body1" gutterBottom>
                                    <strong>Question:</strong> {answer.question.text}
                                  </Typography>

                                  {answer.question.type === 'multiple-choice' ? (
                                    <>
                                      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                                        <strong>Your Answer:</strong>
                                      </Typography>
                                      <Typography
                                        variant="body1"
                                        sx={{
                                          color: answer.isCorrect ? 'success.main' : 'error.main',
                                          fontWeight: 'medium'
                                        }}
                                      >
                                        {answer.selectedOption}
                                      </Typography>

                                      {!answer.isCorrect && (
                                        <>
                                          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                                            <strong>Correct Answer:</strong>
                                          </Typography>
                                          <Typography variant="body1" color="success.main" fontWeight="medium">
                                            {answer.question.correctAnswer}
                                          </Typography>
                                        </>
                                      )}
                                    </>
                                  ) : (
                                    <>
                                      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                                        <strong>Your Answer:</strong>
                                      </Typography>
                                      <Typography variant="body1" sx={{ mb: 2 }}>
                                        {answer.textAnswer || 'No answer provided'}
                                      </Typography>

                                      <Typography variant="body2" color="text.secondary">
                                        <strong>Model Answer:</strong>
                                      </Typography>
                                      <Typography variant="body1" sx={{ mb: 2 }}>
                                        {answer.question.correctAnswer}
                                      </Typography>

                                      {answer.feedback && (
                                        <>
                                          <Typography variant="body2" color="text.secondary">
                                            <strong>Feedback:</strong>
                                          </Typography>
                                          <Typography variant="body1">
                                            {answer.feedback}
                                          </Typography>
                                        </>
                                      )}
                                    </>
                                  )}
                                </AccordionDetails>
                              </Accordion>
                            ))
                          ) : (
                            <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
                              No questions in this section.
                            </Typography>
                          )}
                        </>
                      )}
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Zoom>
          </Grid>
        </Grid>
        </Container>
      </StudentLayout>
    );
  }

  // Show list of all results
  return (
    <StudentLayout>
      <Container maxWidth="lg" sx={{ mb: 4 }}>
        <Grow in={true} timeout={800}>
        <Paper
          elevation={3}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 4,
            background: 'linear-gradient(135deg, #4a148c 0%, #7c43bd 100%)',
            color: 'white',
          }}
        >
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Your Exam Results
          </Typography>
          <Typography variant="subtitle1">
            View your performance on completed exams
          </Typography>
        </Paper>
      </Grow>

      {results.length > 0 ? (
        <Grid container spacing={3}>
          {results.map((result, index) => {
            const percentage = calculatePercentage(result.totalScore, result.maxPossibleScore);

            return (
              <Grid item xs={12} md={6} lg={4} key={result._id}>
                <Zoom in={true} style={{ transitionDelay: `${200 + (index * 100)}ms` }}>
                  <Card
                    elevation={3}
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.3s ease',
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
                        bgcolor: percentage >= 80
                          ? 'success.main'
                          : percentage >= 60
                            ? 'warning.main'
                            : 'error.main',
                      }}
                    />

                    <CardContent sx={{ flexGrow: 1, pt: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="h6" component="h2" fontWeight="bold">
                          {result.exam.title}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Box key={star} component={star <= Math.ceil(percentage / 20) ? Star : StarBorder}
                              sx={{
                                color: 'secondary.main',
                                fontSize: '1rem'
                              }}
                            />
                          ))}
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <AccessTime sx={{ color: 'text.secondary', mr: 1, fontSize: '0.875rem' }} />
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(result.endTime)}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Box>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Your Score
                          </Typography>
                          <Typography variant="h5" fontWeight="bold" color={
                            percentage >= 80
                              ? 'success.main'
                              : percentage >= 60
                                ? 'warning.main'
                                : 'error.main'
                          }>
                            {percentage}%
                          </Typography>
                          <Typography variant="body2">
                            {result.totalScore} / {result.maxPossibleScore} points
                          </Typography>
                        </Box>

                        <GradeBadge score={percentage} />
                      </Box>

                      <LinearProgress
                        variant="determinate"
                        value={percentage}
                        color={
                          percentage >= 80
                            ? 'success'
                            : percentage >= 60
                              ? 'warning'
                              : 'error'
                        }
                        sx={{ height: 8, borderRadius: 4, mb: 3 }}
                      />
                    </CardContent>

                    <Divider />

                    <Box sx={{ p: 2 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        component={RouterLink}
                        to={`/student/results/${result._id}`}
                        fullWidth
                        sx={{ py: 1 }}
                      >
                        View Detailed Results
                      </Button>
                    </Box>
                  </Card>
                </Zoom>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <Paper
          elevation={1}
          sx={{
            p: 4,
            textAlign: 'center',
            borderRadius: 2,
            bgcolor: 'background.paper'
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No results found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You haven't completed any exams yet. Take an exam to see your results here.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            component={RouterLink}
            to="/student/exams"
            sx={{ mt: 3 }}
          >
            View Available Exams
          </Button>
        </Paper>
      )}
      </Container>
    </StudentLayout>
  );
};

export default Results;
