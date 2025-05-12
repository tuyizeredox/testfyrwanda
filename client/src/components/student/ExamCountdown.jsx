import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Grow,
  Divider,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Timer,
  Info,
  Warning,
  CheckCircle,
  ArrowForward,
  Block,
  LockOutlined,
  CheckBox
} from '@mui/icons-material';
import api from '../../services/api';

const ExamCountdown = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(5);
  const [startingExam, setStartingExam] = useState(false);

  // Fetch exam details
  useEffect(() => {
    const fetchExam = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/exam/${id}`);

        // Check if exam is locked
        if (response.data.isLocked) {
          setError('This exam is currently locked by the administrator. Please try again later.');
          setLoading(false);
          return;
        }

        console.log('Exam data from API:', response.data);
        console.log('Selective answering enabled:', response.data.allowSelectiveAnswering);
        console.log('Section B required questions:', response.data.sectionBRequiredQuestions);
        console.log('Section C required questions:', response.data.sectionCRequiredQuestions);

        setExam(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching exam:', err);
        setError(err.response?.data?.message || 'Failed to load exam. Please try again later.');
        setLoading(false);
      }
    };

    fetchExam();
  }, [id]);

  // Countdown timer
  useEffect(() => {
    if (!loading && !error && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (countdown === 0 && !startingExam) {
      handleStartExam();
    }
  }, [countdown, loading, error, startingExam]);

  // Prevent navigation away
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
      return '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Start the exam
  const handleStartExam = async () => {
    try {
      setStartingExam(true);

      // Start the exam
      await api.post(`/exam/${id}/start`);

      // Navigate to the exam interface
      navigate(`/student/exam/${id}`);
    } catch (err) {
      console.error('Error starting exam:', err);
      setError(err.response?.data?.message || 'Failed to start exam. Please try again later.');
      setStartingExam(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading exam...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 8 }}>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            textAlign: 'center',
            borderRadius: 0,
            position: 'relative',
            overflow: 'hidden',
            mb: 4
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '4px',
              bgcolor: 'error.main',
            }}
          />

          <Typography variant="h5" component="h1" fontWeight="bold" gutterBottom color="error.main">
            {error.includes('locked') ? 'Exam Locked' : 'Error'}
          </Typography>

          {error.includes('locked') && (
            <Box sx={{ my: 3, display: 'flex', justifyContent: 'center' }}>
              <LockOutlined sx={{ fontSize: 60, color: 'error.main', opacity: 0.7 }} />
            </Box>
          )}

          <Typography variant="body1" paragraph>
            {error}
          </Typography>

          <Typography variant="body2" color="text.secondary" paragraph>
            Please contact your administrator if you believe this is an error.
          </Typography>

          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/student/exams')}
            sx={{ mt: 2, borderRadius: 0 }}
          >
            Back to Exams
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 8 }}>
      <Grow in={true} timeout={800}>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 0,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '4px',
              background: 'linear-gradient(90deg, #4a148c 0%, #ff6d00 100%)',
            }}
          />

          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom textAlign="center">
            {exam.title}
          </Typography>

          <Typography variant="body1" color="text.secondary" paragraph textAlign="center">
            {exam.description}
          </Typography>

          {/* Debug info - remove in production */}
          {process.env.NODE_ENV === 'development' && (
            <Box sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', fontSize: '12px', textAlign: 'left' }}>
              <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: '12px', display: 'block' }}>
                allowSelectiveAnswering: {String(exam.allowSelectiveAnswering)}
              </Typography>
              <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: '12px', display: 'block' }}>
                sectionBRequiredQuestions: {exam.sectionBRequiredQuestions}
              </Typography>
              <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: '12px', display: 'block' }}>
                sectionCRequiredQuestions: {exam.sectionCRequiredQuestions}
              </Typography>
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          <Box sx={{ textAlign: 'center', my: 4 }}>
            <Typography variant="h6" gutterBottom>
              Your exam will start in:
            </Typography>

            <Box
              sx={{
                display: 'inline-flex',
                position: 'relative',
                justifyContent: 'center',
                alignItems: 'center',
                my: 2
              }}
            >
              <CircularProgress
                variant="determinate"
                value={(countdown / 5) * 100}
                size={120}
                thickness={4}
                sx={{ color: 'primary.main' }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="h3" component="div" fontWeight="bold" color="primary">
                  {countdown}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Alert severity="warning" sx={{ mb: 3, borderRadius: 0 }}>
            <Typography variant="body1" fontWeight="medium">
              Important: Do not leave or refresh this page. Your exam will start automatically.
            </Typography>
          </Alert>

          {/* Selective Answering Alert */}
          {exam.allowSelectiveAnswering && (
            <Alert
              severity="info"
              sx={{
                mb: 3,
                borderRadius: 0,
                borderLeft: '4px solid',
                borderColor: 'secondary.main'
              }}
              icon={<CheckBox color="secondary" />}
            >
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Selective Answering Enabled for this Exam
              </Typography>
              <Typography variant="body2">
                In this exam, you can choose which questions to answer in Sections B and C.
                You'll need to select {exam.sectionBRequiredQuestions} questions from Section B and {exam.sectionCRequiredQuestions} questions from Section C.
                Unselected questions won't count against your score.
              </Typography>
            </Alert>
          )}

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Exam Details:
            </Typography>

            <List>
              <ListItem>
                <ListItemIcon>
                  <Timer color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Time Limit"
                  secondary={`${exam.timeLimit} minutes`}
                />
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  <Info color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Questions"
                  secondary={`${exam.sections?.reduce((total, section) => total + section.questions.length, 0) || 0} questions in ${exam.sections?.length || 0} sections`}
                />
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  <Warning color="error" />
                </ListItemIcon>
                <ListItemText
                  primary="Important"
                  secondary="Once started, you must complete the exam. The timer cannot be paused."
                />
              </ListItem>

              {/* Selective Answering Information */}
              {exam.allowSelectiveAnswering && (
                <ListItem>
                  <ListItemIcon>
                    <CheckBox color="secondary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Selective Answering Enabled"
                    secondary={
                      <React.Fragment>
                        <Typography variant="body2" component="span">
                          You can choose which questions to answer in Sections B and C:
                        </Typography>
                        <Box component="ul" sx={{ mt: 0.5, mb: 0 }}>
                          <Box component="li">
                            <Typography variant="body2">
                              Section B: Select any {exam.sectionBRequiredQuestions || '?'} questions
                            </Typography>
                          </Box>
                          <Box component="li">
                            <Typography variant="body2">
                              Section C: Select any {exam.sectionCRequiredQuestions || '?'} questions
                            </Typography>
                          </Box>
                        </Box>
                      </React.Fragment>
                    }
                  />
                </ListItem>
              )}
            </List>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              variant="outlined"
              color="error"
              onClick={() => navigate('/student/exams')}
              startIcon={<Block />}
              sx={{ borderRadius: 0 }}
              disabled={countdown <= 2 || startingExam}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              color="primary"
              onClick={handleStartExam}
              endIcon={<ArrowForward />}
              sx={{ borderRadius: 0 }}
              disabled={startingExam}
            >
              {startingExam ? 'Starting Exam...' : 'Start Now'}
            </Button>
          </Box>
        </Paper>
      </Grow>
    </Container>
  );
};

export default ExamCountdown;
