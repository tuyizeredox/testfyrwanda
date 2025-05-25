import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  TextField,
  Stepper,
  Step,
  StepButton,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  LinearProgress,
  Chip,
  Zoom,
  Slide,
  Grow,
  IconButton,
  Tooltip,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  useTheme
} from '@mui/material';
import {
  ArrowBack,
  ArrowForward,
  Check,
  Timer,
  Warning,
  Flag,
  Save,
  Send,
  HelpOutline,
  NavigateBefore,
  NavigateNext,
  Lock,
  InfoOutlined,
  CheckCircle,
  RadioButtonUnchecked,
  TouchApp,
  Fullscreen,
  FullscreenExit,
  Security,
  DragIndicator,
  SwapVert
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { useThemeMode } from '../../context/ThemeContext';
import api from '../../services/api';
// Import security CSS
import './ExamSecurity.css';

// Styled components for gamified UI
const QuestionCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'answered'
})(({ theme, answered: answeredProp }) => {
  // Convert boolean prop to string to avoid React warnings
  // Remove the prop from the DOM by handling it here
  const isAnswered = answeredProp === true || answeredProp === 'true';
  const isDark = theme.palette.mode === 'dark';

  return {
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    borderRadius: '12px',
    backgroundColor: isDark
      ? alpha(theme.palette.background.paper, 0.95)
      : theme.palette.background.paper,
    backdropFilter: 'blur(10px)',
    border: isDark
      ? `1px solid ${alpha(theme.palette.divider, 0.2)}`
      : 'none',
    boxShadow: isDark
      ? '0 8px 32px rgba(0,0,0,0.3)'
      : '0 4px 20px rgba(0,0,0,0.08)',
    borderLeft: isAnswered ? `5px solid ${theme.palette.success.main}` : isDark ? `1px solid ${alpha(theme.palette.primary.main, 0.3)}` : 'none',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: isDark
        ? '0 12px 40px rgba(0,0,0,0.4)'
        : '0 8px 30px rgba(0,0,0,0.12)',
    },
    '&::before': isAnswered ? {
      content: '""',
      position: 'absolute',
      top: 0,
      right: 0,
      width: '30px',
      height: '30px',
      background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
      transform: 'rotate(45deg) translate(15px, -15px)',
      zIndex: 1,
      boxShadow: isDark ? '0 4px 12px rgba(76, 175, 80, 0.3)' : '0 2px 8px rgba(76, 175, 80, 0.2)'
    } : {},
    '&::after': isAnswered ? {
      content: '""',
      position: 'absolute',
      top: '5px',
      right: '5px',
      width: '10px',
      height: '10px',
      borderRight: '2px solid white',
      borderBottom: '2px solid white',
      transform: 'rotate(45deg)',
      zIndex: 2
    } : {}
  };
});

const TimerDisplay = styled(Box)(({ theme, warning }) => {
  const isDark = theme.palette.mode === 'dark';

  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(1, 2),
    borderRadius: '8px',
    background: warning
      ? warning === 'danger'
        ? `linear-gradient(135deg, ${theme.palette.error.main}, ${theme.palette.error.dark})`
        : `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`
      : `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
    color: 'white',
    fontWeight: 'bold',
    boxShadow: isDark
      ? warning === 'danger'
        ? '0 6px 20px rgba(244, 67, 54, 0.4)'
        : warning === 'warning'
          ? '0 6px 20px rgba(255, 152, 0, 0.4)'
          : '0 6px 20px rgba(25, 118, 210, 0.4)'
      : '0 4px 12px rgba(0, 0, 0, 0.2)',
    border: isDark ? `1px solid ${alpha('#ffffff', 0.2)}` : 'none',
    animation: warning === 'danger' ? 'pulse 1s infinite' : 'none',
    '@keyframes pulse': {
      '0%': {
        boxShadow: isDark
          ? '0 0 0 0 rgba(244, 67, 54, 0.7)'
          : '0 0 0 0 rgba(213, 0, 0, 0.7)'
      },
      '70%': {
        boxShadow: isDark
          ? '0 0 0 10px rgba(244, 67, 54, 0)'
          : '0 0 0 10px rgba(213, 0, 0, 0)'
      },
      '100%': {
        boxShadow: isDark
          ? '0 0 0 0 rgba(244, 67, 54, 0)'
          : '0 0 0 0 rgba(213, 0, 0, 0)'
      }
    }
  };
});

const SectionChip = styled(Chip, {
  shouldForwardProp: (prop) => prop !== 'active'
})(({ theme, active: activeProp }) => {
  // Convert boolean prop to string to avoid React warnings
  // Remove the prop from the DOM by handling it here
  const isActive = activeProp === true || activeProp === 'true';
  const isDark = theme.palette.mode === 'dark';

  return {
    fontWeight: 'bold',
    borderRadius: '8px',
    backgroundColor: isActive
      ? theme.palette.primary.main
      : isDark
        ? alpha(theme.palette.background.paper, 0.8)
        : theme.palette.grey[200],
    color: isActive
      ? 'white'
      : theme.palette.text.primary,
    border: isDark && !isActive
      ? `1px solid ${alpha(theme.palette.divider, 0.3)}`
      : 'none',
    '&:hover': {
      backgroundColor: isActive
        ? theme.palette.primary.dark
        : isDark
          ? alpha(theme.palette.primary.main, 0.2)
          : theme.palette.grey[300],
      transform: 'translateY(-1px)',
      boxShadow: isDark
        ? '0 6px 20px rgba(0,0,0,0.3)'
        : '0 4px 12px rgba(0,0,0,0.15)',
    },
    transition: 'all 0.3s ease',
    transform: isActive ? 'scale(1.05)' : 'scale(1)',
    boxShadow: isActive
      ? isDark
        ? '0 6px 24px rgba(25, 118, 210, 0.4)'
        : '0 4px 12px rgba(25, 118, 210, 0.3)'
      : isDark
        ? '0 2px 8px rgba(0,0,0,0.2)'
        : '0 1px 4px rgba(0,0,0,0.1)',
  };
});

// Main component
const ExamInterface = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { mode } = useThemeMode();

  // Security state variables
  const [securityActive, setSecurityActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [warningCount, setWarningCount] = useState(0);
  const [fullscreenExitWarning, setFullscreenExitWarning] = useState(false);
  const [showFullscreenPrompt, setShowFullscreenPrompt] = useState(false);
  const [showTimeWarning, setShowTimeWarning] = useState(false);

  const [exam, setExam] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('A');
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [examCompleted, setExamCompleted] = useState(false);
  const [examResult, setExamResult] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  const [confirmNavigation, setConfirmNavigation] = useState(false);
  const [selectiveAnswering, setSelectiveAnswering] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState({});

  // Format time remaining
  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Enhanced exam submission with better validation and error handling
  const handleSubmitExam = useCallback(async () => {
    try {
      setSubmitting(true);

      // Show submitting message
      setSnackbar({
        open: true,
        message: 'Preparing to submit your exam...',
        severity: 'info'
      });

      // Validate exam state before submission
      if (!exam || !exam.sections || exam.sections.length === 0) {
        throw new Error('Invalid exam data. Please refresh the page and try again.');
      }

      // First, save any unsaved essay answers (no character limit)
      const unsavedAnswers = Object.entries(answers).filter(([_, answer]) =>
        answer.hasChanges &&
        !answer.savedToServer
      );

      if (unsavedAnswers.length > 0) {
        setSnackbar({
          open: true,
          message: `Saving ${unsavedAnswers.length} unsaved answers before submitting...`,
          severity: 'info'
        });

        // Save each unsaved answer with enhanced error handling
        for (const [questionId, answer] of unsavedAnswers) {
          try {
            // Find the question type
            const question = exam?.sections
              .flatMap(section => section.questions)
              .find(q => q._id === questionId);

            if (question && answer.textAnswer) {
              // Validate answer before saving
              const cleanAnswer = answer.textAnswer.trim();
              if (cleanAnswer.length > 0) {
                await saveAnswerToServer(questionId, cleanAnswer, question.type);
              }
            }
          } catch (error) {
            console.error(`Error saving answer ${questionId} before submission:`, error);
            // Show warning but continue with submission
            setSnackbar({
              open: true,
              message: `Warning: Could not save answer for question ${questionId}. Continuing with submission...`,
              severity: 'warning'
            });
          }
        }
      }

      // Validate that we have at least some answers
      const totalAnswers = Object.keys(answers).length;
      const answeredQuestions = Object.values(answers).filter(answer =>
        answer.answered || answer.textAnswer?.trim() || answer.selectedOption
      ).length;

      if (answeredQuestions === 0) {
        throw new Error('No answers found. Please answer at least one question before submitting.');
      }

      // Now submit the exam with enhanced retry logic
      setSnackbar({
        open: true,
        message: 'Submitting your exam...',
        severity: 'info'
      });

      console.log(`Submitting exam ${id} for completion (${answeredQuestions}/${totalAnswers} questions answered)`);

      // Enhanced retry logic with exponential backoff
      let retries = 3;
      let success = false;
      let response = null;
      let lastError = null;

      while (retries > 0 && !success) {
        try {
          // Add timeout to prevent hanging
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Submission timeout')), 30000);
          });

          response = await Promise.race([
            api.post(`/exam/${id}/complete`),
            timeoutPromise
          ]);

          success = true;
          console.log('Exam submitted successfully:', response.data);
        } catch (submitError) {
          lastError = submitError;
          console.warn(`Exam submission attempt failed, retries left: ${retries - 1}`, submitError);
          retries--;

          if (retries > 0) {
            // Exponential backoff: wait longer between retries
            const waitTime = (4 - retries) * 2000; // 2s, 4s, 6s
            setSnackbar({
              open: true,
              message: `Submission failed. Retrying in ${waitTime/1000} seconds... (${retries} attempts left)`,
              severity: 'warning'
            });
            await new Promise(resolve => setTimeout(resolve, waitTime));
          }
        }
      }

      if (!success) {
        throw lastError || new Error('Failed to submit exam after multiple attempts');
      }

      // Validate response data
      if (!response.data) {
        throw new Error('Invalid response from server. Please contact your administrator.');
      }

      setExamCompleted(true);
      setExamResult(response.data);
      setSubmitting(false);

      // Show success message with score if available
      const successMessage = response.data.percentage !== undefined
        ? `Exam submitted successfully! Score: ${response.data.percentage.toFixed(1)}%`
        : 'Exam submitted successfully! Your results are being processed.';

      setSnackbar({
        open: true,
        message: successMessage,
        severity: 'success'
      });

    } catch (err) {
      console.error('Error submitting exam:', err);
      setSubmitting(false);

      // Provide specific error messages based on error type
      let errorMessage = 'Failed to submit exam. Please try again.';

      if (err.message.includes('timeout')) {
        errorMessage = 'Submission timed out. Please check your internet connection and try again.';
      } else if (err.message.includes('Invalid exam data')) {
        errorMessage = err.message;
      } else if (err.message.includes('No answers found')) {
        errorMessage = err.message;
      } else if (err.response) {
        switch (err.response.status) {
          case 400:
            errorMessage = 'Invalid submission data. Please check your answers and try again.';
            break;
          case 404:
            errorMessage = 'Exam session not found. Please refresh the page and try again.';
            break;
          case 409:
            errorMessage = 'Exam has already been submitted or is no longer available.';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later or contact your administrator.';
            break;
          default:
            errorMessage = `Submission failed (Error ${err.response.status}). Please try again.`;
        }
      }

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });

      // Only set critical error state for server errors
      if (err.response && err.response.status >= 500) {
        setError('Server error. Please try again later or contact your administrator.');
      }
    }
  }, [id, exam, answers, setSnackbar, setSubmitting, setExamCompleted, setExamResult, setError]);

  // Function to toggle fullscreen mode
  const toggleFullscreen = useCallback(() => {
    if (!isFullscreen) {
      // Enter fullscreen
      try {
        const docEl = document.documentElement;

        // Instead of trying multiple times automatically, just show the prompt
        // after the first failure, since browsers require user interaction
        const requestFullscreen = async () => {
          try {
            // Check if fullscreen is available
            if (!document.fullscreenEnabled &&
                !document.webkitFullscreenEnabled &&
                !document.mozFullScreenEnabled &&
                !document.msFullscreenEnabled) {
              console.log('Fullscreen not supported or enabled in this browser');
              setShowFullscreenPrompt(true);
              return;
            }

            // Try to enter fullscreen
            if (docEl.requestFullscreen) {
              await docEl.requestFullscreen();
            } else if (docEl.mozRequestFullScreen) {
              await docEl.mozRequestFullScreen();
            } else if (docEl.webkitRequestFullscreen) {
              await docEl.webkitRequestFullscreen();
            } else if (docEl.msRequestFullscreen) {
              await docEl.msRequestFullscreen();
            }

            console.log('Fullscreen entered successfully');
            setIsFullscreen(true);
            setShowFullscreenPrompt(false); // Hide prompt if it was showing
          } catch (error) {
            console.error('Error entering fullscreen:', error);

            // Most likely this is a permissions error - browsers require user interaction
            // to enter fullscreen mode. Show the prompt to let the user click the button.
            setShowFullscreenPrompt(true);
          }
        };

        // Try once, and if it fails, show the prompt
        requestFullscreen();
      } catch (error) {
        console.error('Error in toggleFullscreen:', error);
        // Show the prompt if we encounter an error
        setShowFullscreenPrompt(true);
      }
    } else {
      // Exit fullscreen
      try {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
        setIsFullscreen(false);
      } catch (error) {
        console.error('Error exiting fullscreen:', error);
      }
    }
  }, [isFullscreen]);

  // Get timer warning level
  const getTimerWarning = () => {
    const totalTime = exam?.timeLimit * 60 * 1000;
    const percentRemaining = (timeRemaining / totalTime) * 100;

    if (percentRemaining <= 10) {
      return 'danger';
    } else if (percentRemaining <= 25) {
      return 'warning';
    }
    return null;
  };

  // Fetch exam and start session
  useEffect(() => {
    // We'll handle fullscreen in the security effect instead of here
    // to prevent continuous reloading issues

    const fetchExam = async () => {
      try {
        setLoading(true);
        setError(null);

        // First, get the exam details to check if it's locked
        const examRes = await api.get(`/exam/${id}`);

        setExam(examRes.data);
        setSelectiveAnswering(examRes.data.allowSelectiveAnswering || false);

        // Set the active section to the first section that has questions
        const firstSectionWithQuestions = examRes.data.sections?.find(section =>
          section.questions && section.questions.length > 0
        );
        if (firstSectionWithQuestions) {
          setActiveSection(firstSectionWithQuestions.name);
          setActiveQuestionIndex(0);
        }

        // Check if exam is locked
        if (examRes.data.isLocked) {
          setError(examRes.data.message || 'This exam is currently locked by the administrator. Please try again later.');
          setLoading(false);
          return;
        }

        // Check if there's an existing session
        const sessionRes = await api.get(`/student/exams/${id}/session`);

        if (sessionRes.data) {
          // Session exists, use it
          setSession(sessionRes.data);

          // Set time remaining
          setTimeRemaining(sessionRes.data.timeRemaining || 0);

          // Initialize answers from session
          const initialAnswers = {};
          const initialSelectedQuestions = {};

          sessionRes.data.answers.forEach(answer => {
            // Get the question to determine its section
            const question = examRes.data.sections
              .flatMap(section => section.questions)
              .find(q => q._id === answer.question._id);

            const questionSection = question ? question.section : null;

            // For sections B and C, check if the question is selected
            let isSelected = true;

            if (answer.isSelected !== undefined) {
              // Use the saved selection state from the backend
              isSelected = answer.isSelected;
              console.log(`Using backend selection state for question ${answer.question._id}: ${isSelected}`);
            } else if (selectiveAnswering && (questionSection === 'B' || questionSection === 'C')) {
              // Fallback: calculate selection state using the same logic as backend
              const sectionQuestions = examRes.data.sections
                .find(s => s.name === questionSection)
                ?.questions || [];

              // Sort questions by ID for consistency with backend
              const sortedSectionQuestions = [...sectionQuestions].sort((a, b) =>
                a._id.localeCompare(b._id)
              );

              // Get required questions count for this section
              const requiredCount = questionSection === 'B'
                ? (examRes.data.sectionBRequiredQuestions || 3)
                : (examRes.data.sectionCRequiredQuestions || 1);

              // Get the index of this question in its section
              const questionIndexInSection = sortedSectionQuestions.findIndex(q => q._id === answer.question._id);

              // Select only the first N questions by default (same logic as backend)
              isSelected = questionIndexInSection < requiredCount;
              console.log(`Fallback selection for question ${answer.question._id} in section ${questionSection}: index ${questionIndexInSection}/${sortedSectionQuestions.length}, required ${requiredCount}, selected: ${isSelected}`);
            }

            initialAnswers[answer.question._id] = {
              selectedOption: answer.selectedOption || '',
              textAnswer: answer.textAnswer || '',
              answered: !!(answer.selectedOption || answer.textAnswer),
              section: questionSection
            };

            initialSelectedQuestions[answer.question._id] = isSelected;
          });

          setAnswers(initialAnswers);
          setSelectedQuestions(initialSelectedQuestions);

          // Log the restored selection state for debugging
          console.log('Restored selection state:', initialSelectedQuestions);
        } else {
          // No session, start a new one
          try {
            const startRes = await api.post(`/exam/${id}/start`);
            setSession(startRes.data);

            // Set time remaining
            setTimeRemaining(examRes.data.timeLimit * 60 * 1000);

            // Initialize empty answers
            const initialAnswers = {};
            const initialSelectedQuestions = {};

            startRes.data.answers.forEach(answer => {
              // Get the question to determine its section
              const question = examRes.data.sections
                .flatMap(section => section.questions)
                .find(q => q._id === answer.question._id);

              const questionSection = question ? question.section : null;

              // Use the selection state from the backend (should always be available for new sessions)
              let isSelected = true;

              if (answer.isSelected !== undefined) {
                // Backend has already initialized the selection state
                isSelected = answer.isSelected;
                console.log(`New session: Using backend selection state for question ${answer.question._id}: ${isSelected}`);
              } else if (selectiveAnswering && (questionSection === 'B' || questionSection === 'C')) {
                // Fallback: calculate selection state using the same logic as backend
                const sectionQuestions = examRes.data.sections
                  .find(s => s.name === questionSection)
                  ?.questions || [];

                // Sort questions by ID for consistency with backend
                const sortedSectionQuestions = [...sectionQuestions].sort((a, b) =>
                  a._id.localeCompare(b._id)
                );

                // Get required questions count for this section
                const requiredCount = questionSection === 'B'
                  ? (examRes.data.sectionBRequiredQuestions || 3)
                  : (examRes.data.sectionCRequiredQuestions || 1);

                // Get the index of this question in its section
                const questionIndexInSection = sortedSectionQuestions.findIndex(q => q._id === answer.question._id);

                // Select only the first N questions by default (same logic as backend)
                isSelected = questionIndexInSection < requiredCount;
                console.log(`New session fallback: Auto-selecting question ${answer.question._id} in section ${questionSection}: index ${questionIndexInSection}/${sortedSectionQuestions.length}, required ${requiredCount}, selected: ${isSelected}`);
              }

              initialAnswers[answer.question._id] = {
                selectedOption: '',
                textAnswer: '',
                answered: false,
                section: questionSection
              };

              initialSelectedQuestions[answer.question._id] = isSelected;
            });

            setAnswers(initialAnswers);
            setSelectedQuestions(initialSelectedQuestions);

            // Log the initial selection state for debugging
            console.log('Initial selection state:', initialSelectedQuestions);
          } catch (startErr) {
            // Handle locked exam error from start endpoint
            if (startErr.response && startErr.response.status === 403) {
              setError(startErr.response.data.message || 'This exam is currently locked by the administrator. Please try again later.');
            } else {
              throw startErr;
            }
          }
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching exam:', err);
        setError(err.response?.data?.message || 'Failed to load exam. Please try again later.');
        setLoading(false);
      }
    };

    fetchExam();
  }, [id]);

  // Timer countdown
  useEffect(() => {
    if (!loading && timeRemaining > 0 && !examCompleted) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          // Check if time is about to run out (5 minutes remaining)
          const fiveMinutes = 5 * 60 * 1000;
          if (prev === fiveMinutes) {
            // Show time warning dialog
            setShowTimeWarning(true);

            // Also show a snackbar warning
            setSnackbar({
              open: true,
              message: 'Warning: Only 5 minutes remaining in your exam!',
              severity: 'error'
            });
          }

          // Check if time is critically low (1 minute remaining)
          const oneMinute = 60 * 1000;
          if (prev === oneMinute) {
            // Show a final warning
            setSnackbar({
              open: true,
              message: 'Warning: Only 1 minute remaining! Your exam will be submitted automatically when time expires.',
              severity: 'error'
            });
          }

          // If time is up, submit the exam automatically
          if (prev <= 1000) {
            clearInterval(timer);

            // Show a message that time is up
            setSnackbar({
              open: true,
              message: 'Time is up! Your exam is being submitted automatically.',
              severity: 'error'
            });

            // Submit the exam directly without showing confirmation dialog
            handleSubmitExam();
            return 0;
          }

          return prev - 1000;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [loading, timeRemaining, examCompleted, handleSubmitExam]);

  // Create a ref outside the effect to track fullscreen requests
  const hasRequestedFullscreen = React.useRef(false);

  // Combined security effect - handles all security features
  useEffect(() => {
    // Only activate security when exam is active and fully loaded
    if (loading || examCompleted || !exam) {
      setSecurityActive(false);
      return;
    }

    // Activate security measures
    setSecurityActive(true);

    // Show the fullscreen prompt immediately if not in fullscreen mode
    if (!hasRequestedFullscreen.current && !isFullscreen) {
      hasRequestedFullscreen.current = true;

      // Show the fullscreen prompt immediately
      setShowFullscreenPrompt(true);
    }

    // Function to handle fullscreen changes
    const handleFullscreenChange = () => {
      const isDocFullscreen = !!(
        document.fullscreenElement ||
        document.mozFullScreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement
      );

      setIsFullscreen(isDocFullscreen);

      // If user returns to fullscreen, clear any pending submit timers and hide the warning
      if (isDocFullscreen && window.examSubmitTimer) {
        clearTimeout(window.examSubmitTimer);
        window.examSubmitTimer = null;
        setFullscreenExitWarning(false);
      }

      // If user manually exits fullscreen and we're in an active exam, show warning and terminate exam
      if (!isDocFullscreen && !examCompleted) {
        setWarningCount(prev => prev + 1);

        // Show the fullscreen exit warning dialog
        setFullscreenExitWarning(true);

        // After a short delay, submit the exam automatically
        const submitTimer = setTimeout(() => {
          // Submit the exam directly without showing confirmation dialog
          handleSubmitExam();
        }, 10000); // Give them 10 seconds to return to fullscreen

        // Store the timer ID so we can clear it if needed
        window.examSubmitTimer = submitTimer;
      }
    };

    // Add fullscreen event listeners
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    // Clean up
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [loading, examCompleted, exam, isFullscreen, toggleFullscreen, setShowFullscreenPrompt]);

  // Prevent navigation away during exam
  useEffect(() => {
    // Function to handle beforeunload event (closing tab/window)
    const handleBeforeUnload = (e) => {
      if (!examCompleted) {
        const message = 'You are in the middle of an exam. If you leave, your progress may be lost. Are you sure you want to leave?';
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };

    // Function to handle popstate event (browser back/forward buttons)
    const handlePopState = (e) => {
      if (!examCompleted) {
        // Prevent navigation by pushing the current URL back to history
        window.history.pushState(null, '', window.location.pathname);

        // Show the navigation confirmation dialog
        setConfirmNavigation(true);

        // Also show a warning message
        setSnackbar({
          open: true,
          message: 'Navigation is disabled during the exam. Please complete or submit your exam.',
          severity: 'warning'
        });

        e.preventDefault();
      }
    };

    // Function to handle keyboard shortcuts
    const handleKeyDown = (e) => {
      if (!examCompleted) {
        // Prevent F5 (refresh)
        if (e.key === 'F5') {
          e.preventDefault();
          setSnackbar({
            open: true,
            message: 'Page refresh is disabled during the exam.',
            severity: 'warning'
          });
          setWarningCount(prev => prev + 1);
          return false;
        }

        // Prevent Ctrl+C (copy)
        if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
          e.preventDefault();
          setSnackbar({
            open: true,
            message: 'Copying content is not allowed during the exam.',
            severity: 'warning'
          });
          setWarningCount(prev => prev + 1);
          return false;
        }

        // Prevent Ctrl+R (refresh)
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
          e.preventDefault();
          setSnackbar({
            open: true,
            message: 'Page refresh is disabled during the exam.',
            severity: 'warning'
          });
          setWarningCount(prev => prev + 1);
          return false;
        }

        // Prevent Alt+Tab
        if (e.altKey && e.key === 'Tab') {
          e.preventDefault();
          setSnackbar({
            open: true,
            message: 'Switching applications is not allowed during the exam.',
            severity: 'warning'
          });
          setWarningCount(prev => prev + 1);
          return false;
        }

        // Prevent PrintScreen
        if (e.key === 'PrintScreen') {
          e.preventDefault();
          setSnackbar({
            open: true,
            message: 'Screen capture is not allowed during the exam.',
            severity: 'warning'
          });
          setWarningCount(prev => prev + 1);
          return false;
        }
      }
    };

    // Function to handle visibility change (tab switching)
    const handleVisibilityChange = () => {
      if (document.hidden && !examCompleted) {
        // User switched to another tab
        setWarningCount(prev => prev + 1);
        setSnackbar({
          open: true,
          message: 'Switching tabs during the exam is not allowed. This incident has been recorded.',
          severity: 'error'
        });
      }
    };

    // Add event listener to prevent context menu
    const handleContextMenu = (e) => {
      if (!examCompleted) {
        e.preventDefault();
        return false;
      }
    };

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('contextmenu', handleContextMenu);

    // Push current state to history to enable popstate detection
    window.history.pushState(null, '', window.location.pathname);

    // Clean up event listeners on component unmount
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [examCompleted]);

  // Get questions for current section
  const getCurrentSectionQuestions = useCallback(() => {
    if (!exam) return [];

    // Check if exam has sections
    if (!exam.sections || exam.sections.length === 0) {
      return [];
    }

    const section = exam.sections.find(s => s.name === activeSection);
    if (!section) {
      // If the active section doesn't exist, use the first available section
      if (exam.sections.length > 0) {
        setActiveSection(exam.sections[0].name);
        return exam.sections[0].questions || [];
      }
      return [];
    }

    return section.questions || [];
  }, [exam, activeSection]);

  // Get current question
  const getCurrentQuestion = useCallback(() => {
    const questions = getCurrentSectionQuestions();
    return questions[activeQuestionIndex] || null;
  }, [getCurrentSectionQuestions, activeQuestionIndex]);



  // Handle section change
  const handleSectionChange = (section) => {
    // Show loading indicator when changing sections
    setQuestionsLoading(true);

    // Set a small timeout to allow the loading state to be visible
    // This improves user experience by showing a transition
    setTimeout(() => {
      // Only change to sections that have questions
      const targetSection = exam.sections.find(s => s.name === section);
      if (targetSection && targetSection.questions && targetSection.questions.length > 0) {
        setActiveSection(section);
        setActiveQuestionIndex(0);
      } else {
        // Show a message to the user
        setSnackbar({
          open: true,
          message: `Section ${section} has no questions available`,
          severity: 'warning'
        });
      }
      setQuestionsLoading(false);
    }, 300);
  };

  // Handle question navigation
  const handleNextQuestion = async () => {
    // Get current question
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return;

    // Check if there are unsaved changes for the current question
    const currentAnswer = answers[currentQuestion._id];

    // If it's an essay question with unsaved changes, save it first (no character limit)
    if (currentQuestion.type === 'open-ended' &&
        currentAnswer &&
        currentAnswer.hasChanges &&
        !currentAnswer.savedToServer) {

      // Show saving message
      setSnackbar({
        open: true,
        message: 'Saving your answer before moving to the next question...',
        severity: 'info'
      });

      try {
        // Save the current answer - no character limit validation
        await saveAnswerToServer(
          currentQuestion._id,
          currentAnswer.textAnswer,
          'open-ended'
        );
      } catch (error) {
        console.error('Error saving answer before navigation:', error);
        // Continue with navigation even if save fails
      }
    }

    // Now proceed with navigation
    const questions = getCurrentSectionQuestions();
    if (activeQuestionIndex < questions.length - 1) {
      setActiveQuestionIndex(activeQuestionIndex + 1);
    } else {
      // Move to next section with questions if available
      const sectionIndex = exam.sections.findIndex(s => s.name === activeSection);
      if (sectionIndex < exam.sections.length - 1) {
        // Find the next section that has questions
        let nextSectionIndex = sectionIndex + 1;
        let foundSection = false;

        while (nextSectionIndex < exam.sections.length && !foundSection) {
          const nextSection = exam.sections[nextSectionIndex];
          if (nextSection.questions && nextSection.questions.length > 0) {
            foundSection = true;
            setActiveSection(nextSection.name);
            setActiveQuestionIndex(0);

            // Show a message about moving to the next section
            setSnackbar({
              open: true,
              message: `Moving to Section ${nextSection.name}`,
              severity: 'info'
            });
          } else {
            nextSectionIndex++;
          }
        }

        if (!foundSection) {
          // If no section with questions was found, show a message
          setSnackbar({
            open: true,
            message: 'No more sections with questions available',
            severity: 'info'
          });
        }
      }
    }
  };

  const handlePrevQuestion = () => {
    if (activeQuestionIndex > 0) {
      setActiveQuestionIndex(activeQuestionIndex - 1);
    } else {
      // Move to previous section with questions if available
      const sectionIndex = exam.sections.findIndex(s => s.name === activeSection);
      if (sectionIndex > 0) {
        // Find the previous section that has questions
        let prevSectionIndex = sectionIndex - 1;
        let foundSection = false;

        while (prevSectionIndex >= 0 && !foundSection) {
          const prevSection = exam.sections[prevSectionIndex];
          if (prevSection.questions && prevSection.questions.length > 0) {
            foundSection = true;
            setActiveSection(prevSection.name);
            const prevSectionQuestions = prevSection.questions || [];
            setActiveQuestionIndex(prevSectionQuestions.length - 1);

            // Show a message about moving to the previous section
            setSnackbar({
              open: true,
              message: `Moving to Section ${prevSection.name}`,
              severity: 'info'
            });
          } else {
            prevSectionIndex--;
          }
        }

        if (!foundSection) {
          // If no section with questions was found, show a message
          setSnackbar({
            open: true,
            message: 'No previous sections with questions available',
            severity: 'info'
          });
        }
      }
    }
  };

  // Enhanced handle answer change for all question types
  const handleAnswerChange = (questionId, value, type) => {

    // Don't allow changing already submitted answers
    if (answers[questionId]?.answered && answers[questionId]?.savedToServer) {
      return;
    }

    // Create new answer object
    const newAnswer = { ...answers[questionId] };

    // Handle different question types appropriately
    switch (type) {
      case 'multiple-choice':
      case 'true-false':
        newAnswer.selectedOption = value;
        newAnswer.answered = true;
        newAnswer.savedToServer = false;

        // Update local state
        setAnswers(prev => ({
          ...prev,
          [questionId]: newAnswer
        }));

        // Submit answer to server immediately for multiple choice and true/false
        saveAnswerToServer(questionId, value, type);
        return;

      case 'matching':
        newAnswer.matchingAnswers = value.matchingAnswers || value;
        newAnswer.answered = true;
        newAnswer.savedToServer = false;

        // Update local state
        setAnswers(prev => ({
          ...prev,
          [questionId]: newAnswer
        }));

        // Save immediately for interactive questions
        saveAnswerToServer(questionId, newAnswer.matchingAnswers, type);
        return;

      case 'ordering':
        newAnswer.orderingAnswer = value.orderingAnswer || value;
        newAnswer.answered = true;
        newAnswer.savedToServer = false;

        // Update local state
        setAnswers(prev => ({
          ...prev,
          [questionId]: newAnswer
        }));

        // Save immediately for interactive questions
        saveAnswerToServer(questionId, newAnswer.orderingAnswer, type);
        return;

      case 'drag-drop':
        newAnswer.dragDropAnswer = value.dragDropAnswer || value;
        newAnswer.answered = true;
        newAnswer.savedToServer = false;

        // Update local state
        setAnswers(prev => ({
          ...prev,
          [questionId]: newAnswer
        }));

        // Save immediately for interactive questions
        saveAnswerToServer(questionId, newAnswer.dragDropAnswer, type);
        return;

      case 'fill-in-blank':
      case 'open-ended':
      default:
        // For text-based questions, just update local state without saving to server
        newAnswer.textAnswer = value;
        newAnswer.answered = false; // Don't mark as answered until explicitly saved
        newAnswer.savedToServer = false;
        newAnswer.hasChanges = true;

        setAnswers(prev => ({
          ...prev,
          [questionId]: newAnswer
        }));
        return;
    }
  };

  // Enhanced function to save answer to server with better validation and error handling
  const saveAnswerToServer = async (questionId, value, type) => {
    try {
      // Validate inputs
      if (!questionId) {
        throw new Error('Question ID is required');
      }

      // Get the current question
      const question = exam.sections
        .flatMap(section => section.questions)
        .find(q => q._id === questionId);

      if (!question) {
        throw new Error('Question not found');
      }

      // Detect the actual question type using AI if needed
      const detectedType = detectQuestionType(question);
      const actualType = type || detectedType;

      // Validate value based on question type
      if (!value && actualType !== 'multiple-choice' && actualType !== 'true-false') {
        // For non-multiple choice questions, require some content
        if (typeof value === 'string' && value.trim().length === 0) {
          throw new Error('Answer cannot be empty');
        }
      }

      // Show saving indicator (less intrusive for frequent saves)
      console.log(`Saving ${actualType} answer for question ${questionId}`);

      // Enhanced retry logic with exponential backoff
      let retries = 3;
      let success = false;
      let lastError = null;

      while (retries > 0 && !success) {
        try {
          const payload = {
            questionId,
            questionType: actualType
          };

          // Ensure value is properly formatted and validated
          let cleanValue;

          if (typeof value === 'object' && value !== null) {
            // Handle complex objects (matching, ordering, etc.)
            cleanValue = value;
          } else {
            // Handle string values
            cleanValue = String(value || '').trim();
          }

          switch (actualType) {
            case 'multiple-choice':
            case 'true-false':
              payload.selectedOption = cleanValue;
              break;
            case 'fill-in-blank':
              if (!cleanValue) {
                throw new Error('Fill-in-blank answer cannot be empty');
              }
              payload.textAnswer = cleanValue;
              payload.questionType = 'fill-in-blank';
              break;
            case 'matching':
              if (!value || typeof value !== 'object') {
                throw new Error('Invalid matching answer format');
              }
              payload.matchingAnswers = value;
              break;
            case 'ordering':
              if (!value || typeof value !== 'object') {
                throw new Error('Invalid ordering answer format');
              }
              payload.orderingAnswer = value;
              break;
            case 'drag-drop':
              if (!value || typeof value !== 'object') {
                throw new Error('Invalid drag-drop answer format');
              }
              payload.dragDropAnswer = value;
              break;
            case 'open-ended':
            case 'essay':
            case 'short-answer':
            default:
              payload.textAnswer = cleanValue;
              break;
          }

          // Add timeout to prevent hanging
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Save timeout')), 10000);
          });

          await Promise.race([
            api.post(`/exam/${id}/answer`, payload),
            timeoutPromise
          ]);

          success = true;
          console.log(`Successfully saved ${actualType} answer for question ${questionId}`);
        } catch (submitError) {
          lastError = submitError;
          retries--;

          if (retries > 0) {
            // Exponential backoff
            const waitTime = (4 - retries) * 1000; // 1s, 2s, 3s
            console.warn(`Save attempt failed, retrying in ${waitTime}ms...`, submitError.message);
            await new Promise(resolve => setTimeout(resolve, waitTime));
          }
        }
      }

      if (!success) {
        throw lastError || new Error('Failed to save answer after multiple attempts');
      }

      // Show brief success message only for manual saves
      if (type === 'open-ended' || type === 'essay') {
        setSnackbar({
          open: true,
          message: 'Answer saved successfully',
          severity: 'success'
        });
      }

      // Update local state to mark as saved to server
      setAnswers(prev => ({
        ...prev,
        [questionId]: {
          ...prev[questionId],
          answered: true,
          savedToServer: true,
          hasChanges: false,
          lastSaved: new Date().toISOString()
        }
      }));

    } catch (err) {
      console.error('Error saving answer:', err);

      // Provide specific error messages
      let errorMessage = 'Failed to save answer. Your progress is saved locally.';

      if (err.message.includes('timeout')) {
        errorMessage = 'Save timed out. Please check your connection and try again.';
      } else if (err.message.includes('empty')) {
        errorMessage = err.message;
      } else if (err.message.includes('Invalid')) {
        errorMessage = 'Invalid answer format. Please check your response.';
      }

      // Show error message to user
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'warning'
      });

      // Update local state to indicate save failed but keep the answer
      setAnswers(prev => ({
        ...prev,
        [questionId]: {
          ...prev[questionId],
          answered: true,
          savedToServer: false,
          hasChanges: true,
          lastSaveError: err.message
        }
      }));

      // Re-throw for critical errors that should stop the process
      if (err.message.includes('Question not found') || err.message.includes('Question ID is required')) {
        throw err;
      }
    }
  };



  // Handle question selection for sections B and C
  const handleQuestionSelection = async (questionId) => {
    console.log('=== QUESTION SELECTION TRIGGERED ===');
    console.log('Question ID:', questionId);
    console.log('Selective answering enabled:', selectiveAnswering);
    console.log('Current selectedQuestions state:', selectedQuestions);

    if (!selectiveAnswering) {
      console.log('❌ Selective answering is not enabled');
      setSnackbar({
        open: true,
        message: 'Selective answering is not enabled for this exam',
        severity: 'info'
      });
      return;
    }

    if (!exam || !exam.sections) {
      console.error('❌ Exam data not available');
      setSnackbar({
        open: true,
        message: 'Exam data not available. Please refresh the page.',
        severity: 'error'
      });
      return;
    }

    // Find the question in the exam
    const question = exam.sections
      .flatMap(section => section.questions)
      .find(q => q._id === questionId);

    if (!question) {
      console.error('Question not found:', questionId);
      setSnackbar({
        open: true,
        message: 'Question not found. Please refresh the page.',
        severity: 'error'
      });
      return;
    }

    // Only sections B and C can be selective
    if (question.section === 'A') {
      setSnackbar({
        open: true,
        message: 'Section A questions are required and cannot be deselected',
        severity: 'info'
      });
      return;
    }

    // Get all questions in this section (sorted for consistency)
    const sectionQuestions = exam.sections
      .find(s => s.name === question.section)
      ?.questions || [];

    if (sectionQuestions.length === 0) {
      console.error(`No questions found in section ${question.section}`);
      return;
    }

    // Current selection status
    const currentIsSelected = selectedQuestions[questionId] === true;
    const newIsSelected = !currentIsSelected;

    // Count currently selected questions in this section
    const currentlySelectedInSection = sectionQuestions
      .filter(q => selectedQuestions[q._id] === true)
      .length;

    // Calculate what the count would be after this change
    const selectedAfterChange = newIsSelected
      ? currentlySelectedInSection + 1
      : currentlySelectedInSection - 1;

    // Get required questions count for this section with fallbacks
    const requiredCount = question.section === 'B'
      ? (exam.sectionBRequiredQuestions || 3)
      : (exam.sectionCRequiredQuestions || 1);

    console.log(`Section ${question.section} selection change:`, {
      questionId,
      currentIsSelected,
      newIsSelected,
      currentlySelectedInSection,
      selectedAfterChange,
      requiredCount,
      totalInSection: sectionQuestions.length
    });

    // Check if we're trying to deselect when we're at the minimum
    if (!newIsSelected && selectedAfterChange < requiredCount) {
      setSnackbar({
        open: true,
        message: `You must select at least ${requiredCount} questions in Section ${question.section}`,
        severity: 'warning'
      });
      return;
    }

    // Update selection state immediately for responsive UI
    setSelectedQuestions(prev => ({
      ...prev,
      [questionId]: newIsSelected
    }));

    // Update on the server
    try {
      console.log('🚀 Sending selection request to server...');
      console.log('Request details:', {
        url: `/api/exam/${id}/select-question`,
        questionId,
        isSelected: newIsSelected,
        examId: id,
        baseURL: api.defaults.baseURL
      });

      // Validate exam ID format before making the request
      if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
        throw new Error('Invalid exam ID format. Please refresh the page.');
      }

      const response = await api.post(`/exam/${id}/select-question`, {
        questionId,
        isSelected: newIsSelected
      });

      console.log('✅ Selection update response:', response.data);

      // Verify the response indicates success
      if (response.data.success !== false) {
        // Show success message with clear feedback
        const sectionName = question.section;
        const requiredCount = question.section === 'B'
          ? (exam.sectionBRequiredQuestions || 3)
          : (exam.sectionCRequiredQuestions || 1);

        setSnackbar({
          open: true,
          message: newIsSelected
            ? `✅ Question ${activeQuestionIndex + 1} selected! (${selectedAfterChange}/${sectionQuestions.length} selected in Section ${sectionName}, ${requiredCount} required)`
            : `⭕ Question ${activeQuestionIndex + 1} deselected (${selectedAfterChange}/${sectionQuestions.length} selected in Section ${sectionName}, ${requiredCount} required)`,
          severity: 'success'
        });
        console.log('✅ Question selection updated successfully');
      } else {
        throw new Error(response.data.message || 'Server returned unsuccessful response');
      }


    } catch (error) {
      console.error('❌ Error updating question selection:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data
        }
      });

      // Revert the change if the server update fails
      setSelectedQuestions(prev => ({
        ...prev,
        [questionId]: !newIsSelected
      }));

      // Show error message with detailed server message if available
      const errorData = error.response?.data;
      const errorMessage = errorData?.message || 'Failed to update question selection';
      const errorCode = errorData?.error || errorData?.errorCode;
      const statusInfo = error.response?.status ? ` [${error.response.status}]` : '';

      let userFriendlyMessage = errorMessage;

      // Provide user-friendly messages for specific error codes
      if (errorCode === 'QUESTION_NOT_FOUND') {
        userFriendlyMessage = 'Question not found. Please refresh the page and try again.';
      } else if (errorCode === 'ANSWER_NOT_FOUND') {
        userFriendlyMessage = 'Question not found in your exam session. Please refresh the page.';
      } else if (errorCode === 'SAVE_FAILED') {
        userFriendlyMessage = 'Failed to save your selection. Please check your connection and try again.';
      } else if (error.response?.status === 400) {
        userFriendlyMessage = errorMessage; // Use server message for validation errors
      } else if (error.response?.status === 404) {
        if (error.config?.url?.includes('/select-question')) {
          userFriendlyMessage = 'Question selection feature is not available on this server. Please contact your administrator.';
        } else {
          userFriendlyMessage = 'Resource not found. Please refresh the page and try again.';
        }
      } else if (error.response?.status === 401) {
        userFriendlyMessage = 'You are not authorized. Please log in again.';
      } else if (error.response?.status === 403) {
        userFriendlyMessage = 'You do not have permission to perform this action.';
      } else if (error.response?.status >= 500) {
        userFriendlyMessage = 'Server error occurred. Please try again in a moment.';
      }

      setSnackbar({
        open: true,
        message: `❌ ${userFriendlyMessage}${statusInfo}`,
        severity: 'error'
      });

      console.error('Detailed error info:', {
        userFriendlyMessage,
        originalMessage: errorMessage,
        errorCode,
        status: error.response?.status,
        questionId,
        examId: id
      });

      // Log additional error details for debugging
      if (error.response?.data) {
        console.error('Server error details:', error.response.data);
      }
    }
  };

  // Calculate progress
  const calculateProgress = useCallback(() => {
    if (!exam || !answers) return 0;

    let answeredCount = 0;
    let totalCount = 0;

    exam.sections.forEach(section => {
      section.questions.forEach(question => {
        // Only count questions that are selected (or all if selective answering is disabled)
        if (!selectiveAnswering ||
            section.name === 'A' ||
            selectedQuestions[question._id]) {
          totalCount++;
          if (answers[question._id]?.answered) {
            answeredCount++;
          }
        }
      });
    });

    return totalCount > 0 ? (answeredCount / totalCount) * 100 : 0;
  }, [exam, answers, selectiveAnswering, selectedQuestions]);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading exam...
        </Typography>

        {/* Prominent fullscreen button in case automatic fullscreen fails */}
        {!isFullscreen && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="body2" color="error" gutterBottom>
              For security reasons, this exam must be taken in fullscreen mode.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<Fullscreen />}
              onClick={toggleFullscreen}
              sx={{
                mt: 1,
                animation: 'pulse-warning 1.5s infinite',
                fontWeight: 'bold',
                px: 3,
                py: 1.5
              }}
            >
              Enter Fullscreen Mode
            </Button>
          </Box>
        )}
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
            borderRadius: 0, // Remove rounded corners
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
              <Lock sx={{ fontSize: 60, color: 'error.main', opacity: 0.7 }} />
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
            startIcon={<ArrowBack />}
            sx={{ mt: 2, borderRadius: 0 }} // Remove rounded corners
          >
            Back to Exams
          </Button>
        </Paper>
      </Container>
    );
  }

  if (examCompleted && examResult) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
        <Grow in={true} timeout={800}>
          <Paper
            elevation={3}
            sx={{
              p: 4,
              textAlign: 'center',
              borderRadius: 0, // Remove rounded corners
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
                height: '8px',
                background: 'linear-gradient(90deg, #4a148c 0%, #ff6d00 100%)',
              }}
            />

            <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
              Exam Completed!
            </Typography>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                my: 4
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  width: 200,
                  height: 200,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <CircularProgress
                  variant="determinate"
                  value={100}
                  size={200}
                  thickness={4}
                  sx={{ color: 'grey.300', position: 'absolute' }}
                />
                <CircularProgress
                  variant="determinate"
                  value={examResult.maxPossibleScore > 0 ? (examResult.totalScore / examResult.maxPossibleScore) * 100 : 0}
                  size={200}
                  thickness={4}
                  sx={{ color: 'secondary.main', position: 'absolute' }}
                />
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="h3" component="div" fontWeight="bold" color="secondary.main">
                    {examResult.maxPossibleScore > 0
                      ? Math.round((examResult.totalScore / examResult.maxPossibleScore) * 100)
                      : 0}%
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {examResult.totalScore || 0} / {examResult.maxPossibleScore || 0} points
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Typography variant="h6" gutterBottom>
              Thank you for completing the exam!
            </Typography>

            <Typography variant="body1" color="text.secondary" paragraph>
              Your answers have been submitted successfully. You can now view your detailed results.
            </Typography>

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => navigate('/student/exams')}
                startIcon={<ArrowBack />}
                sx={{ borderRadius: 0 }} // Remove rounded corners
              >
                Back to Exams
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate(`/student/results/${session._id}`)}
                endIcon={<ArrowForward />}
                sx={{ borderRadius: 0 }} // Remove rounded corners
              >
                View Detailed Results
              </Button>
            </Box>
          </Paper>
        </Grow>
      </Container>
    );
  }

  const currentQuestion = getCurrentQuestion();
  const progress = calculateProgress();
  const timerWarning = getTimerWarning();

  // Security features are implemented in the navigation prevention effect

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: mode === 'dark'
          ? 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%)'
          : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 50%, #e8f4f8 100%)',
        backgroundAttachment: 'fixed',
        py: 2
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          mt: 2,
          mb: 4,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: mode === 'dark'
              ? 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%)'
              : 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.05) 0%, transparent 50%)',
            pointerEvents: 'none',
            zIndex: -1
          }
        }}
        className={securityActive && !examCompleted ? 'exam-secure-content' : ''}
      >
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Selective Answering Banner */}
      {selectiveAnswering && (
        <Paper
          elevation={2}
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 0,
            bgcolor: 'info.lighter',
            borderLeft: '4px solid',
            borderColor: 'info.main',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight="bold" color="info.main">
              Selective Answering Enabled
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ mt: 1 }}>
            In this exam, you can choose which questions to answer in Sections B and C:
          </Typography>
          <Box component="ul" sx={{ mt: 1, pl: 2 }}>
            <Box component="li">
              <Typography variant="body2">
                <strong>Section B:</strong> Select any {exam?.sectionBRequiredQuestions || '?'} questions to answer
              </Typography>
            </Box>
            <Box component="li">
              <Typography variant="body2">
                <strong>Section C:</strong> Select any {exam?.sectionCRequiredQuestions || '?'} questions to answer
              </Typography>
            </Box>
          </Box>
          <Typography variant="body2" sx={{ mt: 1, fontWeight: 'medium', color: 'info.dark' }}>
            💡 <strong>How to select/deselect questions:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1, pl: 3, mb: 0 }}>
            <Box component="li">
              <Typography variant="body2">
                <strong>Method 1:</strong> Hold <kbd style={{ padding: '2px 6px', backgroundColor: '#f5f5f5', borderRadius: '3px', fontFamily: 'monospace' }}>SHIFT</kbd> and click on a question number
              </Typography>
            </Box>
            <Box component="li">
              <Typography variant="body2">
                <strong>Method 2:</strong> Right-click on a question number
              </Typography>
            </Box>
            <Box component="li">
              <Typography variant="body2">
                <strong>Method 3:</strong> Click the selection chip above each question
              </Typography>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Exam Header */}
      <Paper
        elevation={mode === 'dark' ? 8 : 3}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 2,
          position: 'relative',
          overflow: 'hidden',
          bgcolor: mode === 'dark'
            ? alpha(theme.palette.background.paper, 0.95)
            : 'background.paper',
          backdropFilter: 'blur(10px)',
          border: mode === 'dark'
            ? `1px solid ${alpha(theme.palette.primary.main, 0.3)}`
            : 'none',
          boxShadow: mode === 'dark'
            ? '0 8px 32px rgba(0,0,0,0.4)'
            : '0 4px 20px rgba(0,0,0,0.1)'
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={7}>
            <Typography variant="h5" component="h1" fontWeight="bold">
              {exam.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {exam.description?.substring(0, 100)}
              {exam.description?.length > 100 ? '...' : ''}
            </Typography>
          </Grid>

          <Grid item xs={12} md={5} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, alignItems: 'center', gap: 2 }}>
            {/* Security indicator */}
            {warningCount > 0 && (
              <Tooltip title={`${warningCount} security warnings detected`}>
                <Chip
                  icon={<Warning />}
                  label={`${warningCount} warnings`}
                  color="error"
                  size="small"
                  className="exam-warning-pulse"
                  sx={{
                    animation: 'pulse-warning 1.5s infinite',
                    fontWeight: 'bold'
                  }}
                />
              </Tooltip>
            )}

            {/* Timer */}
            <TimerDisplay warning={timerWarning}>
              <Timer sx={{ mr: 1 }} />
              {formatTime(timeRemaining)}
            </TimerDisplay>

            {/* Fullscreen toggle */}
            <Tooltip title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}>
              <IconButton
                color="primary"
                onClick={toggleFullscreen}
                sx={{
                  bgcolor: 'primary.lighter',
                  '&:hover': { bgcolor: 'primary.light' }
                }}
              >
                {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
              </IconButton>
            </Tooltip>

            {/* Submit button */}
            <Button
              variant="contained"
              color="primary"
              onClick={() => setConfirmSubmit(true)}
              startIcon={<Send />}
              disabled={submitting}
              sx={{ borderRadius: 0 }} // Remove rounded corners
            >
              Submit Exam
            </Button>
          </Grid>
        </Grid>

        {/* Progress bar */}
        <Box sx={{ mt: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Progress
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {Math.round(progress)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>
      </Paper>

      {/* Exam Content */}
      <Grid container spacing={4}>
        {/* Sidebar */}
        <Grid item xs={12} md={3}>
          <Paper
            elevation={mode === 'dark' ? 6 : 2}
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: mode === 'dark'
                ? alpha(theme.palette.background.paper, 0.9)
                : 'background.paper',
              border: mode === 'dark'
                ? `1px solid ${alpha(theme.palette.divider, 0.2)}`
                : 'none',
              boxShadow: mode === 'dark'
                ? '0 6px 24px rgba(0,0,0,0.3)'
                : '0 2px 12px rgba(0,0,0,0.08)'
            }}
          >
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Sections
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
              {/* Only show sections that have questions */}
              {exam.sections
                .filter(section => section.questions && section.questions.length > 0)
                .map((section) => (
                  <Tooltip
                    key={section.name}
                    title={section.description || `Section ${section.name}`}
                    placement="right"
                    arrow
                  >
                    <Box>
                      <SectionChip
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                            <Typography component="span">
                              Section {section.name}
                            </Typography>
                            <Chip
                              size="small"
                              label={section.questions?.length || 0}
                              color={activeSection === section.name ? "secondary" : "default"}
                              sx={{ ml: 1, height: 20, minWidth: 28 }}
                            />
                          </Box>
                        }
                        onClick={() => handleSectionChange(section.name)}
                        active={activeSection === section.name}
                        clickable
                      />
                      {activeSection === section.name && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, ml: 1 }}>
                          {section.description}
                        </Typography>
                      )}
                    </Box>
                  </Tooltip>
                ))}
            </Box>

            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Questions
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {getCurrentSectionQuestions().map((question, index) => {
                // Determine if this question is in a section with selective answering
                const isSelectiveSection = selectiveAnswering &&
                  (question.section === 'B' || question.section === 'C');

                // Determine if this question is selected for answering
                // For non-selective sections (A), always selected
                // For selective sections (B, C), check the selectedQuestions state
                const isSelected = isSelectiveSection
                  ? selectedQuestions[question._id] === true
                  : true;

                // Determine chip color based on selection and answer status
                let chipColor = 'default';
                let chipVariant = 'outlined';

                if (answers[question._id]?.answered) {
                  // Question has been answered
                  chipColor = 'success';
                  chipVariant = 'filled';
                } else if (isSelectiveSection) {
                  // Selective section - show selection status
                  if (isSelected) {
                    chipColor = 'primary';
                    chipVariant = 'filled';
                  } else {
                    chipColor = 'default';
                    chipVariant = 'outlined';
                  }
                } else {
                  // Non-selective section (always required)
                  chipColor = 'secondary';
                  chipVariant = 'filled';
                }

                return (
                  <Tooltip
                    key={question._id}
                    title={
                      answers[question._id]?.answered
                        ? "✅ Question answered"
                        : isSelectiveSection
                        ? isSelected
                          ? "✅ Selected for answering • Shift+click or right-click to deselect"
                          : "⭕ Not selected • Shift+click or right-click to select"
                        : "📝 Required question"
                    }
                    arrow
                    placement="top"
                  >
                    <Chip
                      label={index + 1}
                      onClick={(e) => {
                        // If shift key is pressed and selective answering is enabled for this section,
                        // toggle selection, otherwise navigate to the question
                        if (e.shiftKey && isSelectiveSection) {
                          handleQuestionSelection(question._id);
                        } else {
                          setActiveQuestionIndex(index);
                        }
                      }}
                      onContextMenu={(e) => {
                        // Prevent default context menu
                        e.preventDefault();
                        // Toggle selection on right-click if selective answering is enabled
                        if (isSelectiveSection) {
                          handleQuestionSelection(question._id);
                        }
                      }}
                      color={chipColor}
                      variant={activeQuestionIndex === index ? 'filled' : chipVariant}
                      icon={isSelectiveSection
                        ? isSelected
                          ? <CheckCircle fontSize="small" />
                          : <RadioButtonUnchecked fontSize="small" />
                        : answers[question._id]?.answered
                        ? <CheckCircle fontSize="small" />
                        : null}
                      sx={{
                        minWidth: 40,
                        fontWeight: 'bold',
                        transition: 'all 0.3s ease',
                        transform: activeQuestionIndex === index ? 'scale(1.15)' : 'scale(1)',
                        border: activeQuestionIndex === index ? '2px solid' : undefined,
                        borderColor: activeQuestionIndex === index ? 'primary.main' : undefined,
                        ...(isSelectiveSection && !isSelected && {
                          opacity: 0.7,
                          filter: 'grayscale(0.3)',
                        }),
                        ...(isSelectiveSection && {
                          cursor: 'pointer',
                          '&:hover': {
                            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                            transform: activeQuestionIndex === index ? 'scale(1.15)' : 'scale(1.05)',
                            filter: 'none'
                          }
                        }),
                        // Add visual emphasis for answered questions
                        ...(answers[question._id]?.answered && {
                          boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
                        })
                      }}
                    />
                  </Tooltip>
                );
              })}
            </Box>
          </Paper>
        </Grid>

        {/* Question Area */}
        <Grid item xs={12} md={9}>
          <Zoom in={true} key={currentQuestion?._id}>
            <QuestionCard
              elevation={3}
              answered={currentQuestion && answers[currentQuestion._id]?.answered}
            >
              <CardContent sx={{ p: 4 }}>
                {/* Section description */}
                <Box
                  sx={{
                    mb: 3,
                    p: 2,
                    bgcolor: mode === 'dark'
                      ? alpha(theme.palette.primary.main, 0.1)
                      : alpha(theme.palette.primary.main, 0.05),
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: mode === 'dark'
                      ? alpha(theme.palette.primary.main, 0.3)
                      : 'primary.light',
                    boxShadow: mode === 'dark'
                      ? '0 4px 12px rgba(25, 118, 210, 0.2)'
                      : '0 2px 8px rgba(25, 118, 210, 0.1)'
                  }}
                >
                  <Typography variant="subtitle1" fontWeight="bold" color="primary.main" gutterBottom>
                    Section {activeSection}: {exam.sections.find(s => s.name === activeSection)?.description || ''}
                  </Typography>

                  {/* Display section information */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Chip
                      size="small"
                      label={`${getCurrentSectionQuestions().length} Questions`}
                      color="secondary"
                      sx={{ mr: 1 }}
                    />
                    <Chip
                      size="small"
                      label={activeSection === 'A' ? 'Multiple Choice' :
                             activeSection === 'B' ? 'Short Answer' : 'Essay Questions'}
                      color="primary"
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary">
                    {activeSection === 'A' ?
                      'This section contains multiple-choice questions. Select the best answer for each question.' :
                      activeSection === 'B' ?
                      'This section contains short answer questions. Provide concise responses addressing the key points.' :
                      'This section contains essay questions. Provide detailed responses with clear structure and examples.'
                    }
                  </Typography>

                  {/* Selective answering information banner */}
                  {selectiveAnswering && (
                    <Box sx={{
                      mt: 2,
                      p: 2,
                      bgcolor: 'info.lighter',
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'info.main'
                    }}>
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                        <InfoOutlined sx={{ mr: 1, fontSize: '1rem' }} />
                        Selective Answering Enabled
                      </Typography>

                      <Typography variant="body2" paragraph>
                        This exam allows selective answering for Sections B and C:
                      </Typography>

                      <Box component="ul" sx={{ mt: 1, pl: 2 }}>
                        <Box component="li">
                          <Typography variant="body2">
                            <strong>Section A:</strong> All questions are required
                          </Typography>
                        </Box>
                        <Box component="li">
                          <Typography variant="body2">
                            <strong>Section B:</strong> Select any {exam.sectionBRequiredQuestions} questions to answer
                          </Typography>
                        </Box>
                        <Box component="li">
                          <Typography variant="body2">
                            <strong>Section C:</strong> Select any {exam.sectionCRequiredQuestions} questions to answer
                          </Typography>
                        </Box>
                      </Box>

                      <Typography variant="body2" sx={{ mt: 1, fontWeight: 'medium' }}>
                        Only your selected questions will be graded. Unselected questions will not count against your score.
                      </Typography>

                      {(activeSection === 'B' || activeSection === 'C') && (
                        <Box sx={{
                          mt: 2,
                          p: 2,
                          bgcolor: 'primary.lighter',
                          borderRadius: 1,
                          border: '2px solid',
                          borderColor: 'primary.main',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 1
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <TouchApp sx={{ mr: 1, color: 'primary.main' }} />
                            <Typography variant="subtitle2" color="primary.main" fontWeight="bold">
                              {activeSection === 'B'
                                ? `For Section B: Select any ${exam.sectionBRequiredQuestions} questions to answer`
                                : `For Section C: Select any ${exam.sectionCRequiredQuestions} questions to answer`
                              }
                            </Typography>
                          </Box>

                          <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1,
                            ml: 4
                          }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <CheckCircle fontSize="small" color="success" sx={{ mr: 1 }} />
                              <Typography variant="body2">
                                <strong>Selected questions</strong> will be graded
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <RadioButtonUnchecked fontSize="small" color="disabled" sx={{ mr: 1 }} />
                              <Typography variant="body2">
                                <strong>Unselected questions</strong> will not count against your score
                              </Typography>
                            </Box>
                          </Box>

                          <Box sx={{
                            mt: 1,
                            p: 1,
                            bgcolor: 'background.paper',
                            borderRadius: 1,
                            border: '1px dashed',
                            borderColor: 'primary.main'
                          }}>
                            <Typography variant="body2" fontWeight="medium">
                              To select/deselect questions:
                            </Typography>
                            <Box component="ul" sx={{ mt: 0.5, mb: 0, pl: 2 }}>
                              <Box component="li">
                                <Typography variant="body2">
                                  Hold <strong>SHIFT</strong> and click on a question number
                                </Typography>
                              </Box>
                              <Box component="li">
                                <Typography variant="body2">
                                  <strong>Right-click</strong> on a question number
                                </Typography>
                              </Box>
                              <Box component="li">
                                <Typography variant="body2">
                                  Click the selection chip at the top of each question
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </Box>
                      )}

                      {/* Selection Summary for Selective Answering */}
                      {selectiveAnswering && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'info.lighter', borderRadius: 1 }}>
                          <Typography variant="subtitle2" fontWeight="bold" color="info.main" gutterBottom>
                            📊 Selection Summary
                          </Typography>
                          <Grid container spacing={2}>
                            {['B', 'C'].map(sectionName => {
                              const sectionQuestions = exam.sections
                                .find(s => s.name === sectionName)
                                ?.questions || [];
                              const selectedCount = sectionQuestions
                                .filter(q => selectedQuestions[q._id] === true)
                                .length;
                              const requiredCount = sectionName === 'B'
                                ? (exam.sectionBRequiredQuestions || 3)
                                : (exam.sectionCRequiredQuestions || 1);
                              const isComplete = selectedCount >= requiredCount;

                              return (
                                <Grid item xs={6} key={sectionName}>
                                  <Box sx={{
                                    p: 1,
                                    bgcolor: isComplete ? 'success.lighter' : 'warning.lighter',
                                    borderRadius: 1,
                                    border: '1px solid',
                                    borderColor: isComplete ? 'success.main' : 'warning.main'
                                  }}>
                                    <Typography variant="body2" fontWeight="bold">
                                      Section {sectionName}: {selectedCount}/{requiredCount} {isComplete ? '✅' : '⚠️'}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {isComplete ? 'Complete' : `Need ${requiredCount - selectedCount} more`}
                                    </Typography>
                                  </Box>
                                </Grid>
                              );
                            })}
                          </Grid>
                        </Box>
                      )}
                    </Box>
                  )}


                </Box>

                {questionsLoading ? (
                  // Loading indicator for questions
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
                    <CircularProgress size={60} color="secondary" />
                    <Typography variant="h6" sx={{ mt: 3, color: 'text.secondary' }}>
                      Loading questions...
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Preparing Section {activeSection} content
                    </Typography>
                  </Box>
                ) : getCurrentSectionQuestions().length === 0 ? (
                  // No questions in this section
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No questions available in this section
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Please try another section or contact your administrator.
                    </Typography>
                  </Box>
                ) : !currentQuestion ? (
                  // No current question selected
                  <Typography variant="body1" color="text.secondary" align="center">
                    No question selected. Please select a question to continue.
                  </Typography>
                ) : (
                  // Question is available
                  <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                      <Typography variant="subtitle1" color="text.secondary">
                        Section {activeSection} - Question {activeQuestionIndex + 1}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {/* Show selection status for sections B and C */}
                        {selectiveAnswering &&
                         (currentQuestion.section === 'B' || currentQuestion.section === 'C') && (
                          <Chip
                            icon={selectedQuestions[currentQuestion._id]
                              ? <CheckCircle fontSize="small" />
                              : <RadioButtonUnchecked fontSize="small" />}
                            label={selectedQuestions[currentQuestion._id]
                              ? "✅ Selected for answering"
                              : "⭕ Click to select"}
                            color={selectedQuestions[currentQuestion._id] ? "success" : "warning"}
                            variant={selectedQuestions[currentQuestion._id] ? "filled" : "outlined"}
                            size="small"
                            onClick={() => handleQuestionSelection(currentQuestion._id)}
                            sx={{
                              cursor: 'pointer',
                              fontWeight: 'bold',
                              transition: 'all 0.2s ease',
                              animation: !selectedQuestions[currentQuestion._id] ? 'pulse 2s infinite' : 'none',
                              '@keyframes pulse': {
                                '0%': { opacity: 1 },
                                '50%': { opacity: 0.7 },
                                '100%': { opacity: 1 }
                              },
                              '&:hover': {
                                boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                                transform: 'translateY(-2px) scale(1.05)'
                              }
                            }}
                          />
                        )}
                        <Chip
                          label={getQuestionTypeLabel(currentQuestion.type, currentQuestion.section, currentQuestion)}
                          color={getQuestionTypeColor(currentQuestion.type, currentQuestion.section, currentQuestion)}
                          size="small"
                        />
                      </Box>
                    </Box>

                    <Box sx={{ position: 'relative', mb: 3 }}>
                      {/* Question number badge */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: -12,
                          left: -12,
                          bgcolor: 'primary.main',
                          color: 'white',
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          zIndex: 1,
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }}
                      >
                        {activeQuestionIndex + 1}
                      </Box>

                      {/* Question text */}
                      <Typography
                        variant="h6"
                        component="h2"
                        fontWeight="bold"
                        gutterBottom
                        sx={{
                          whiteSpace: 'pre-wrap',  // Preserve line breaks and spacing
                          mb: 2,
                          p: 3,
                          pt: 4,
                          bgcolor: 'background.paper',
                          borderLeft: '4px solid',
                          borderColor: 'primary.main',
                          borderRadius: '4px',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          '& strong, & b': { color: 'primary.main' },
                          '& em, & i': { fontStyle: 'italic', color: 'text.secondary' }
                        }}
                      >
                        {currentQuestion.text}
                      </Typography>

                      {/* Question metadata */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Type: {getQuestionTypeLabel(currentQuestion.type, currentQuestion.section, currentQuestion)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Points: {currentQuestion.points || 1}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Enhanced Question Content Area */}
                    <Box sx={{
                      mt: 4,
                      p: { xs: 2, sm: 3 },
                      bgcolor: mode === 'dark'
                        ? alpha(theme.palette.background.default, 0.6)
                        : 'background.default',
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: mode === 'dark'
                        ? alpha(theme.palette.divider, 0.3)
                        : 'divider',
                      minHeight: '400px',
                      position: 'relative',
                      backdropFilter: mode === 'dark' ? 'blur(10px)' : 'none',
                      boxShadow: mode === 'dark'
                        ? '0 4px 20px rgba(0,0,0,0.2)'
                        : '0 2px 8px rgba(0,0,0,0.05)'
                    }}>
                      {/* Question Type Header */}
                      <Box sx={{
                        mb: 3,
                        p: 2,
                        bgcolor: getQuestionTypeColor(currentQuestion.type, currentQuestion.section, currentQuestion) + '.lighter',
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: getQuestionTypeColor(currentQuestion.type, currentQuestion.section, currentQuestion) + '.main'
                      }}>
                        <Typography variant="h6" fontWeight="bold" color={getQuestionTypeColor(currentQuestion.type, currentQuestion.section, currentQuestion) + '.main'}>
                          {getQuestionTypeLabel(currentQuestion.type, currentQuestion.section, currentQuestion)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Answer this {getQuestionTypeLabel(currentQuestion.type, currentQuestion.section, currentQuestion).toLowerCase()} carefully
                        </Typography>
                      </Box>

                      {(() => {
                        const detectedType = detectQuestionType(currentQuestion);

                        if (detectedType === 'multiple-choice') {
                          return (
                        <FormControl component="fieldset" fullWidth>
                          <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
                            <Box component="span" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <HelpOutline sx={{ mr: 1, fontSize: 20, color: 'primary.main' }} />
                              Select the best answer from the options below:
                            </Box>
                          </Typography>

                          <RadioGroup
                            value={answers[currentQuestion._id]?.selectedOption || ''}
                            onChange={(e) => handleAnswerChange(
                              currentQuestion._id,
                              e.target.value,
                              'multiple-choice'
                            )}
                          >
                            {currentQuestion.options.map((option, index) => (
                              <FormControlLabel
                                key={index}
                                value={option.text}
                                control={
                                  <Radio
                                    disabled={answers[currentQuestion._id]?.answered}
                                    sx={{ '&.Mui-checked': { color: 'primary.main' } }}
                                  />
                                }
                                label={
                                  <Box component="span" sx={{
                                    whiteSpace: 'pre-wrap',  // Preserve line breaks
                                    fontWeight: answers[currentQuestion._id]?.selectedOption === option.text ? 'bold' : 'normal',
                                  }}>
                                    {/* Add option letter for better readability */}
                                    <Typography component="span" fontWeight="bold" color="primary.main">
                                      {/* Use the letter property if available, otherwise fallback to index-based letter */}
                                      {option.letter || String.fromCharCode(65 + index)}. {' '}
                                    </Typography>
                                    {option.text}
                                  </Box>
                                }
                                sx={{
                                  mb: 2,
                                  p: 2,
                                  borderRadius: 2,
                                  width: '100%',
                                  transition: 'all 0.2s ease',
                                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                  '&:hover': {
                                    bgcolor: 'action.hover',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                  },
                                  ...(answers[currentQuestion._id]?.selectedOption === option.text && {
                                    bgcolor: 'primary.lighter',
                                    border: '1px solid',
                                    borderColor: 'primary.main',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                                  })
                                }}
                              />
                            ))}
                          </RadioGroup>

                          {/* Saved indicator for multiple choice */}
                          {answers[currentQuestion._id]?.savedToServer && (
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, color: 'success.main' }}>
                              <Check fontSize="small" sx={{ mr: 0.5 }} />
                              <Typography variant="caption">
                                Answer saved
                              </Typography>
                            </Box>
                          )}
                        </FormControl>
                          );
                        } else if (detectedType === 'true-false') {
                          return (
                        <FormControl component="fieldset" fullWidth>
                          <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
                            <Box component="span" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <HelpOutline sx={{ mr: 1, fontSize: 20, color: 'success.main' }} />
                              Indicate whether the statement is true or false:
                            </Box>
                          </Typography>

                          <RadioGroup
                            value={answers[currentQuestion._id]?.selectedOption || ''}
                            onChange={(e) => handleAnswerChange(
                              currentQuestion._id,
                              e.target.value,
                              'multiple-choice' // Use the same handler as multiple choice
                            )}
                          >
                            {currentQuestion.options.map((option, index) => (
                              <FormControlLabel
                                key={index}
                                value={option.text}
                                control={
                                  <Radio
                                    disabled={answers[currentQuestion._id]?.answered}
                                    sx={{ '&.Mui-checked': { color: 'success.main' } }}
                                  />
                                }
                                label={
                                  <Box component="span" sx={{
                                    fontWeight: answers[currentQuestion._id]?.selectedOption === option.text ? 'bold' : 'normal',
                                  }}>
                                    <Typography component="span" fontWeight="bold" color="success.main">
                                      {option.text}
                                    </Typography>
                                  </Box>
                                }
                                sx={{
                                  mb: 2,
                                  p: 2,
                                  borderRadius: 2,
                                  width: '100%',
                                  transition: 'all 0.2s ease',
                                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                  '&:hover': {
                                    bgcolor: 'action.hover',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                  },
                                  ...(answers[currentQuestion._id]?.selectedOption === option.text && {
                                    bgcolor: 'success.lighter',
                                    border: '1px solid',
                                    borderColor: 'success.main',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                                  })
                                }}
                              />
                            ))}
                          </RadioGroup>

                          {/* Saved indicator for true/false */}
                          {answers[currentQuestion._id]?.savedToServer && (
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, color: 'success.main' }}>
                              <Check fontSize="small" sx={{ mr: 0.5 }} />
                              <Typography variant="caption">
                                Answer saved
                              </Typography>
                            </Box>
                          )}
                        </FormControl>
                          );
                        } else if (detectedType === 'fill-in-blank') {
                          return (
                            <FillInBlankQuestion
                              question={currentQuestion}
                              answer={answers[currentQuestion._id]}
                              onAnswerChange={handleAnswerChange}
                              disabled={answers[currentQuestion._id]?.answered}
                            />
                          );
                        } else if (detectedType === 'enhanced-fill-in-blank') {
                          return (
                        <Box>
                          <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
                            <Box component="span" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <HelpOutline sx={{ mr: 1, fontSize: 20, color: 'warning.main' }} />
                              Fill in the blank with the appropriate word or phrase:
                            </Box>
                          </Typography>

                          {/* Display the question with highlighted blank */}
                          <Box
                            sx={{
                              mb: 3,
                              p: 3,
                              bgcolor: mode === 'dark'
                                ? alpha(theme.palette.warning.main, 0.1)
                                : alpha(theme.palette.warning.main, 0.05),
                              border: '2px solid',
                              borderColor: mode === 'dark'
                                ? alpha(theme.palette.warning.main, 0.5)
                                : alpha(theme.palette.warning.main, 0.3),
                              borderRadius: 2,
                              boxShadow: mode === 'dark'
                                ? '0 4px 12px rgba(255,193,7,0.2)'
                                : '0 2px 8px rgba(0,0,0,0.1)'
                            }}
                          >
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'warning.dark' }}>
                              Complete the sentence:
                            </Typography>
                            <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
                              {currentQuestion.text.split('_____').map((part, index, array) => (
                                <React.Fragment key={index}>
                                  {part}
                                  {index < array.length - 1 && (
                                    <Box
                                      component="span"
                                      sx={{
                                        display: 'inline-block',
                                        px: 2,
                                        py: 0.5,
                                        mx: 1,
                                        borderBottom: '3px solid',
                                        borderColor: answers[currentQuestion._id]?.textAnswer ? 'success.main' : 'warning.main',
                                        backgroundColor: answers[currentQuestion._id]?.textAnswer ?
                                          alpha(theme.palette.success.main, 0.1) :
                                          alpha(theme.palette.warning.main, 0.1),
                                        fontWeight: 'bold',
                                        color: answers[currentQuestion._id]?.textAnswer ? 'success.dark' : 'warning.main',
                                        minWidth: '120px',
                                        textAlign: 'center',
                                        borderRadius: 1,
                                        transition: 'all 0.3s ease',
                                        fontSize: '1.1rem'
                                      }}
                                    >
                                      {answers[currentQuestion._id]?.textAnswer || '[ FILL IN THE BLANK ]'}
                                    </Box>
                                  )}
                                </React.Fragment>
                              ))}
                            </Typography>
                          </Box>

                          <TextField
                            fullWidth
                            placeholder="Type your answer here..."
                            value={answers[currentQuestion._id]?.textAnswer || ''}
                            onChange={(e) => handleAnswerChange(
                              currentQuestion._id,
                              e.target.value,
                              'fill-in-blank'
                            )}
                            onKeyDown={(e) => {
                              // Allow Enter to save the answer
                              if (e.key === 'Enter' && answers[currentQuestion._id]?.hasChanges) {
                                e.preventDefault();
                                saveAnswerToServer(
                                  currentQuestion._id,
                                  answers[currentQuestion._id].textAnswer,
                                  'fill-in-blank'
                                );
                              }
                            }}
                            disabled={answers[currentQuestion._id]?.answered}
                            variant="outlined"
                            autoComplete="off"
                            spellCheck={true}
                            autoFocus={true}
                            sx={{
                              mt: 2,
                              '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                  borderColor: mode === 'dark'
                                    ? alpha(theme.palette.warning.main, 0.6)
                                    : 'warning.light',
                                  borderWidth: '2px'
                                },
                                '&:hover fieldset': {
                                  borderColor: 'warning.main',
                                  borderWidth: '2px'
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: 'warning.main',
                                  borderWidth: '3px',
                                  boxShadow: mode === 'dark'
                                    ? `0 0 0 3px ${alpha(theme.palette.warning.main, 0.3)}`
                                    : `0 0 0 3px ${alpha(theme.palette.warning.main, 0.2)}`
                                },
                                '& input': {
                                  fontSize: '1.2rem',
                                  fontWeight: 600,
                                  textAlign: 'center',
                                  padding: '16px',
                                  backgroundColor: mode === 'dark'
                                    ? alpha(theme.palette.warning.main, 0.05)
                                    : alpha(theme.palette.warning.main, 0.02),
                                  color: theme.palette.text.primary
                                }
                              },
                            }}
                            inputProps={{
                              maxLength: 200, // Reasonable limit for fill-in-blank
                              'aria-label': 'Fill in the blank answer',
                              style: { textAlign: 'center' }
                            }}
                            helperText={
                              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 1 }}>
                                <Typography variant="caption" color="text.secondary">
                                  💡 Tip: Press Enter to save your answer quickly
                                </Typography>
                              </Box>
                            }
                          />

                          {/* Character count and save button for fill-in-blank */}
                          <Box sx={{ mt: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="caption" color="text.secondary">
                                {answers[currentQuestion._id]?.textAnswer?.length || 0} / 200 characters
                              </Typography>

                              {answers[currentQuestion._id]?.textAnswer && (
                                <Typography variant="caption" color="success.main">
                                  ✓ Answer entered
                                </Typography>
                              )}
                            </Box>

                            {answers[currentQuestion._id]?.hasChanges && (
                              <Button
                                variant="contained"
                                color="warning"
                                size="medium"
                                onClick={() => saveAnswerToServer(
                                  currentQuestion._id,
                                  answers[currentQuestion._id].textAnswer,
                                  'fill-in-blank'
                                )}
                                startIcon={<Save />}
                                sx={{
                                  mt: 2,
                                  width: '100%',
                                  py: 1.5,
                                  fontWeight: 'bold',
                                  borderRadius: '8px',
                                  background: mode === 'dark'
                                    ? `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`
                                    : `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`,
                                  boxShadow: mode === 'dark'
                                    ? '0 6px 20px rgba(255, 152, 0, 0.3)'
                                    : '0 4px 12px rgba(255, 152, 0, 0.2)',
                                  '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: mode === 'dark'
                                      ? '0 8px 25px rgba(255, 152, 0, 0.4)'
                                      : '0 6px 16px rgba(255, 152, 0, 0.3)',
                                  }
                                }}
                              >
                                Save Fill-in Answer
                              </Button>
                            )}
                          </Box>

                          {/* Saved indicator for fill-in-blank */}
                          {answers[currentQuestion._id]?.savedToServer && (
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, color: 'success.main' }}>
                              <Check fontSize="small" sx={{ mr: 0.5 }} />
                              <Typography variant="caption">
                                Answer saved
                              </Typography>
                            </Box>
                          )}
                        </Box>
                          );
                        } else if (detectedType === 'matching') {
                          return (
                        <MatchingQuestion
                          question={currentQuestion}
                          answer={answers[currentQuestion._id]}
                          onAnswerChange={handleAnswerChange}
                          disabled={answers[currentQuestion._id]?.answered}
                        />
                          );
                        } else if (detectedType === 'ordering') {
                          return (
                            <OrderingQuestion
                              question={currentQuestion}
                              answer={answers[currentQuestion._id]}
                              onAnswerChange={handleAnswerChange}
                              disabled={answers[currentQuestion._id]?.answered}
                            />
                          );
                        } else if (detectedType === 'drag-drop') {
                          return (
                            <DragDropQuestion
                              question={currentQuestion}
                              answer={answers[currentQuestion._id]}
                              onAnswerChange={handleAnswerChange}
                              disabled={answers[currentQuestion._id]?.answered}
                            />
                          );
                        } else {
                          return (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body1" color="text.secondary" gutterBottom>
                            <Box component="span" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <HelpOutline sx={{ mr: 1, fontSize: 20, color: currentQuestion.section === 'B' ? 'info.main' : 'secondary.main' }} />
                              Answer Guidelines:
                            </Box>
                            {currentQuestion.section === 'B' ? (
                              <Box sx={{
                                p: 2,
                                bgcolor: 'info.lighter',
                                borderLeft: '4px solid',
                                borderColor: 'info.main',
                                borderRadius: 1,
                                mb: 2
                              }}>
                                <Typography variant="body2">
                                  <strong>Short Answer Question:</strong> Provide a concise answer addressing the key points of the question. Aim for 3-5 sentences.
                                </Typography>
                              </Box>
                            ) : (
                              <Box sx={{
                                p: 2,
                                bgcolor: 'secondary.lighter',
                                borderLeft: '4px solid',
                                borderColor: 'secondary.main',
                                borderRadius: 1,
                                mb: 2
                              }}>
                                <Typography variant="body2">
                                  <strong>Essay Question:</strong> Write a detailed response with clear structure. Include:
                                </Typography>
                                <ul style={{ marginTop: '8px', marginBottom: '8px' }}>
                                  <li>Introduction to the topic</li>
                                  <li>Main points with examples</li>
                                  <li>Conclusion summarizing your answer</li>
                                </ul>
                              </Box>
                            )}
                          </Typography>

                          <TextField
                            fullWidth
                            multiline
                            rows={currentQuestion.section === 'C' ? 12 : 6}
                            placeholder={currentQuestion.section === 'C' ?
                              "Write your detailed answer here...\n\nInclude an introduction, main points with examples, and a conclusion." :
                              "Type your answer here..."
                            }
                            value={answers[currentQuestion._id]?.textAnswer || ''}
                            onChange={(e) => handleAnswerChange(
                              currentQuestion._id,
                              e.target.value,
                              'open-ended'
                            )}
                            disabled={answers[currentQuestion._id]?.answered}
                            variant="outlined"
                            sx={{
                              mt: 2,
                              '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                  borderColor: currentQuestion.section === 'B' ? 'info.light' : 'secondary.light',
                                },
                                '&:hover fieldset': {
                                  borderColor: currentQuestion.section === 'B' ? 'info.main' : 'secondary.main',
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: currentQuestion.section === 'B' ? 'info.main' : 'secondary.main',
                                },
                              },
                            }}
                          />

                          <Box sx={{ mt: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                color: currentQuestion.section === 'C' &&
                                  (answers[currentQuestion._id]?.textAnswer?.length || 0) < 300 ?
                                  'warning.main' : 'text.secondary'
                              }}>
                                <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
                                  {currentQuestion.section === 'C' &&
                                    (answers[currentQuestion._id]?.textAnswer?.length || 0) < 300 &&
                                    <InfoOutlined fontSize="small" sx={{ mr: 0.5 }} />
                                  }
                                  {answers[currentQuestion._id]?.textAnswer?.length || 0} characters
                                  {currentQuestion.section === 'C' && ' (recommended: 300+ characters)'}
                                </Typography>
                              </Box>

                              {/* Saved indicator */}
                              {answers[currentQuestion._id]?.savedToServer && (
                                <Box sx={{ display: 'flex', alignItems: 'center', color: 'success.main' }}>
                                  <Check fontSize="small" sx={{ mr: 0.5 }} />
                                  <Typography variant="caption">
                                    Answer saved
                                  </Typography>
                                </Box>
                              )}
                            </Box>

                            {/* Save button for essay questions - no character limit */}
                            {answers[currentQuestion._id]?.hasChanges && (
                              <Button
                                variant={currentQuestion.section === 'B' ? "outlined" : "contained"}
                                color={currentQuestion.section === 'B' ? "info" : "secondary"}
                                size="medium"
                                onClick={() => saveAnswerToServer(
                                  currentQuestion._id,
                                  answers[currentQuestion._id].textAnswer,
                                  'open-ended'
                                )}
                                startIcon={<Save />}
                                sx={{
                                  mt: 2,
                                  width: '100%',
                                  py: 1,
                                  boxShadow: currentQuestion.section === 'C' ? 2 : 0
                                }}
                              >
                                Save Answer
                              </Button>
                            )}
                          </Box>
                        </Box>
                          );
                        }
                      })()}
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                      <Button
                        variant="outlined"
                        onClick={handlePrevQuestion}
                        startIcon={<NavigateBefore />}
                        disabled={
                          // Disable if this is the first question in the first section with questions
                          activeQuestionIndex === 0 &&
                          !exam.sections.slice(0, exam.sections.findIndex(s => s.name === activeSection))
                            .some(s => s.questions && s.questions.length > 0)
                        }
                        sx={{ borderRadius: 0 }} // Remove rounded corners
                      >
                        Previous
                      </Button>

                      <Button
                        variant="contained"
                        onClick={handleNextQuestion}
                        endIcon={<NavigateNext />}
                        disabled={
                          // Disable if this is the last question in the last section with questions
                          activeQuestionIndex === getCurrentSectionQuestions().length - 1 &&
                          !exam.sections.slice(exam.sections.findIndex(s => s.name === activeSection) + 1)
                            .some(s => s.questions && s.questions.length > 0)
                        }
                        sx={{ borderRadius: 0 }} // Remove rounded corners
                      >
                        Next
                      </Button>
                    </Box>
                  </>
                )}
              </CardContent>
            </QuestionCard>
          </Zoom>
        </Grid>
      </Grid>

      {/* Submit Confirmation Dialog */}
      <Dialog
        open={confirmSubmit}
        onClose={() => setConfirmSubmit(false)}
        aria-labelledby="submit-dialog-title"
        aria-describedby="submit-dialog-description"
      >
        <DialogTitle id="submit-dialog-title">
          {"Submit Exam?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="submit-dialog-description">
            Are you sure you want to submit your exam? You have completed {Math.round(progress)}% of the questions.
            {progress < 100 && (
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', color: 'warning.main' }}>
                <Warning sx={{ mr: 1 }} />
                You still have unanswered questions.
              </Box>
            )}

            {/* Show selective answering information */}
            {selectiveAnswering && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'info.lighter', borderRadius: 1 }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Selective Answering Information
                </Typography>

                <Typography variant="body2" sx={{ mb: 2 }}>
                  You are required to answer a minimum number of questions in each section.
                  Unselected questions will not count against your score.
                </Typography>

                {/* Section B selection status */}
                {exam.sections.find(s => s.name === 'B')?.questions?.length > 0 && (
                  <Box sx={{ mb: 1 }}>
                    {(() => {
                      const selectedCount = Object.entries(selectedQuestions).filter(([qId, isSelected]) => {
                        const question = exam.sections
                          .flatMap(s => s.questions)
                          .find(q => q._id === qId);
                        return isSelected && question?.section === 'B';
                      }).length;

                      const isEnough = selectedCount >= exam.sectionBRequiredQuestions;

                      return (
                        <Typography
                          variant="body2"
                          color={isEnough ? "success.main" : "error.main"}
                          sx={{ fontWeight: 'medium' }}
                        >
                          Section B: {selectedCount} of {exam.sectionBRequiredQuestions} required questions selected.
                          {!isEnough && (
                            <Box component="span" sx={{ display: 'block', color: 'error.main', mt: 0.5 }}>
                              Warning: You need to select at least {exam.sectionBRequiredQuestions} questions in Section B.
                            </Box>
                          )}
                        </Typography>
                      );
                    })()}
                  </Box>
                )}

                {/* Section C selection status */}
                {exam.sections.find(s => s.name === 'C')?.questions?.length > 0 && (
                  <Box>
                    {(() => {
                      const selectedCount = Object.entries(selectedQuestions).filter(([qId, isSelected]) => {
                        const question = exam.sections
                          .flatMap(s => s.questions)
                          .find(q => q._id === qId);
                        return isSelected && question?.section === 'C';
                      }).length;

                      const isEnough = selectedCount >= exam.sectionCRequiredQuestions;

                      return (
                        <Typography
                          variant="body2"
                          color={isEnough ? "success.main" : "error.main"}
                          sx={{ fontWeight: 'medium' }}
                        >
                          Section C: {selectedCount} of {exam.sectionCRequiredQuestions} required questions selected.
                          {!isEnough && (
                            <Box component="span" sx={{ display: 'block', color: 'error.main', mt: 0.5 }}>
                              Warning: You need to select at least {exam.sectionCRequiredQuestions} questions in Section C.
                            </Box>
                          )}
                        </Typography>
                      );
                    })()}
                  </Box>
                )}
              </Box>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmSubmit(false)} color="primary">
            Cancel
          </Button>
          <Button
            onClick={() => {
              setConfirmSubmit(false);
              handleSubmitExam();
            }}
            color="primary"
            variant="contained"
            autoFocus
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={24} /> : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Navigation Confirmation Dialog */}
      <Dialog
        open={confirmNavigation}
        onClose={() => setConfirmNavigation(false)}
        aria-labelledby="navigation-dialog-title"
        aria-describedby="navigation-dialog-description"
      >
        <DialogTitle id="navigation-dialog-title" sx={{ color: 'error.main' }}>
          {"Warning: Exam in Progress"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="navigation-dialog-description">
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, color: 'error.main' }}>
              <Warning sx={{ mr: 1, fontSize: 30 }} />
              You are in the middle of an exam!
            </Box>
            <Typography variant="body1" paragraph>
              If you navigate away, your progress may be lost. It's recommended to complete and submit your exam first.
            </Typography>
            <Typography variant="body1" fontWeight="bold">
              Are you sure you want to leave this page?
            </Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmNavigation(false)}
            color="primary"
            variant="contained"
            autoFocus
          >
            Stay on Exam
          </Button>
          <Button
            onClick={() => {
              setConfirmNavigation(false);
              navigate('/student/exams');
            }}
            color="error"
            variant="outlined"
          >
            Leave Anyway
          </Button>
        </DialogActions>
      </Dialog>

      {/* Fullscreen Exit Warning Dialog */}
      <Dialog
        open={fullscreenExitWarning}
        aria-labelledby="fullscreen-exit-title"
        aria-describedby="fullscreen-exit-description"
        sx={{
          '& .MuiDialog-paper': {
            borderLeft: '4px solid',
            borderColor: 'error.main',
            maxWidth: 500
          }
        }}
      >
        <DialogTitle id="fullscreen-exit-title" sx={{ bgcolor: 'error.main', color: 'error.contrastText' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Warning sx={{ mr: 1 }} />
            Security Violation Detected
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="h6" color="error" gutterBottom>
              You have exited fullscreen mode
            </Typography>
            <Typography variant="body1" paragraph>
              Exiting fullscreen mode during an exam is considered a security violation and may be treated as an attempt to cheat.
            </Typography>
            <Typography variant="body1" paragraph>
              Your exam will be automatically submitted in <strong>10 seconds</strong> unless you return to fullscreen mode.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This incident has been recorded and may be reported to your instructor.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              toggleFullscreen();
              setFullscreenExitWarning(false);
            }}
            variant="contained"
            color="primary"
            autoFocus
            startIcon={<Fullscreen />}
          >
            Return to Fullscreen
          </Button>
        </DialogActions>
      </Dialog>

      {/* Fullscreen Required Dialog */}
      <Dialog
        open={showFullscreenPrompt}
        aria-labelledby="fullscreen-required-title"
        aria-describedby="fullscreen-required-description"
        disableEscapeKeyDown
        onClose={(_, reason) => {
          // Prevent closing by clicking outside
          if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
            return;
          }
        }}
        sx={{
          '& .MuiDialog-paper': {
            borderTop: '4px solid',
            borderColor: 'primary.main',
            maxWidth: 500,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          },
          zIndex: 9999 // Ensure it's on top of everything
        }}
      >
        <DialogTitle id="fullscreen-required-title" sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Fullscreen sx={{ mr: 1 }} />
            Fullscreen Mode Required
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="h5" gutterBottom color="primary.main" fontWeight="bold">
              Fullscreen Mode Required
            </Typography>
            <Typography variant="body1" paragraph fontWeight="medium">
              You must enter fullscreen mode to start or continue this exam.
            </Typography>
            <Typography variant="body1" paragraph>
              For exam security and to prevent cheating, this exam can only be taken in fullscreen mode. Your exam cannot proceed until you enter fullscreen mode.
            </Typography>
            <Typography variant="body1" paragraph>
              Please click the button below to enter fullscreen mode. If your browser blocks the automatic fullscreen request,
              you may need to enable it in your browser settings or manually click the fullscreen button.
            </Typography>
            <Box sx={{ mt: 3, p: 2, bgcolor: 'primary.lighter', borderRadius: 1, border: '1px solid', borderColor: 'primary.light' }}>
              <Typography variant="body2" color="primary.dark" fontWeight="medium">
                <InfoOutlined sx={{ fontSize: 'small', mr: 1, verticalAlign: 'middle' }} />
                If you continue to have issues entering fullscreen mode, please contact your instructor or administrator.
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={toggleFullscreen}
            variant="contained"
            color="primary"
            size="large"
            autoFocus
            startIcon={<Fullscreen />}
            sx={{
              py: 2,
              px: 4,
              fontSize: '1.1rem',
              fontWeight: 'bold',
              animation: 'pulse-warning 1.5s infinite',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
              '&:hover': {
                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.3)',
              }
            }}
          >
            Enter Fullscreen Mode
          </Button>
        </DialogActions>
      </Dialog>

      {/* Time Warning Dialog */}
      <Dialog
        open={showTimeWarning}
        onClose={() => setShowTimeWarning(false)}
        aria-labelledby="time-warning-title"
        aria-describedby="time-warning-description"
        sx={{
          '& .MuiDialog-paper': {
            borderTop: '4px solid',
            borderColor: 'error.main',
            maxWidth: 500
          }
        }}
      >
        <DialogTitle id="time-warning-title" sx={{ bgcolor: 'error.main', color: 'error.contrastText' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Timer sx={{ mr: 1 }} />
            Time Warning
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom color="error.main">
              Only 5 minutes remaining!
            </Typography>
            <Typography variant="body1" paragraph>
              You have only 5 minutes left to complete your exam. Please finish your answers and submit your exam.
            </Typography>
            <Typography variant="body1" paragraph>
              When the time expires, your exam will be automatically submitted with your current answers.
            </Typography>
            <Box sx={{ mt: 3, p: 2, bgcolor: 'error.lighter', borderRadius: 1 }}>
              <Typography variant="body2" color="error.dark">
                <Warning sx={{ fontSize: 'small', mr: 1, verticalAlign: 'middle' }} />
                Make sure to save any open answers before time runs out.
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowTimeWarning(false)}
            variant="contained"
            color="primary"
            autoFocus
          >
            Continue Working
          </Button>
        </DialogActions>
      </Dialog>
      </Container>
    </Box>
  );
};

// Enhanced Fill-in-the-Blank Question Component
const FillInBlankQuestion = ({ question, answer, onAnswerChange, disabled }) => {
  const theme = useTheme();
  const { mode } = useThemeMode();
  const [localAnswer, setLocalAnswer] = useState(answer?.textAnswer || '');

  const handleInputChange = (event) => {
    const value = event.target.value;
    setLocalAnswer(value);
    onAnswerChange(question._id, value, 'fill-in-blank');
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      // Save the answer when Enter is pressed
      onAnswerChange(question._id, localAnswer, 'fill-in-blank');
    }
  };

  // Process the question text to highlight blanks
  const processQuestionText = (text) => {
    // Replace various blank patterns with interactive input fields
    const blankPatterns = [
      { pattern: /_{3,}/g, replacement: '___BLANK___' },
      { pattern: /\.{4,}/g, replacement: '___BLANK___' },
      { pattern: /\[.*?\]/g, replacement: '___BLANK___' },
      { pattern: /\(.*?\)/g, replacement: '___BLANK___' }
    ];

    let processedText = text;
    blankPatterns.forEach(({ pattern, replacement }) => {
      processedText = processedText.replace(pattern, replacement);
    });

    return processedText;
  };

  const processedText = processQuestionText(question.text);
  const parts = processedText.split('___BLANK___');

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Fill in the Blank
      </Typography>

      {/* Question with interactive blanks */}
      <Box sx={{ mb: 4, p: 3, bgcolor: mode === 'dark' ? alpha(theme.palette.warning.main, 0.1) : alpha(theme.palette.warning.main, 0.05), borderRadius: 2, border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}` }}>
        <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
          {parts.map((part, index) => (
            <React.Fragment key={index}>
              {part}
              {index < parts.length - 1 && (
                <Box
                  component="span"
                  sx={{
                    display: 'inline-block',
                    px: 2,
                    py: 0.5,
                    mx: 1,
                    borderBottom: '3px solid',
                    borderColor: localAnswer ? 'success.main' : 'warning.main',
                    backgroundColor: localAnswer ?
                      alpha(theme.palette.success.main, 0.1) :
                      alpha(theme.palette.warning.main, 0.1),
                    fontWeight: 'bold',
                    color: localAnswer ? 'success.dark' : 'warning.main',
                    minWidth: '120px',
                    textAlign: 'center',
                    borderRadius: 1,
                    transition: 'all 0.3s ease',
                    fontSize: '1.1rem'
                  }}
                >
                  {localAnswer || '[ FILL IN THE BLANK ]'}
                </Box>
              )}
            </React.Fragment>
          ))}
        </Typography>
      </Box>

      {/* Answer Input */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', color: 'warning.main' }}>
          Your Answer:
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          value={localAnswer}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Type your answer here..."
          autoFocus
          spellCheck={true}
          sx={{
            '& .MuiOutlinedInput-root': {
              fontSize: '1.1rem',
              bgcolor: mode === 'dark' ? alpha(theme.palette.background.paper, 0.8) : 'background.paper',
              '&.Mui-focused': {
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'warning.main',
                  borderWidth: 2
                }
              }
            }
          }}
          helperText={
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                Press Enter to save quickly
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {localAnswer.length}/200 characters
              </Typography>
            </Box>
          }
        />
      </Box>

      {/* Save Button */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Button
          variant="contained"
          color="warning"
          onClick={() => onAnswerChange(question._id, localAnswer, 'fill-in-blank')}
          disabled={disabled || !localAnswer.trim()}
          startIcon={<Save />}
          sx={{
            borderRadius: '12px',
            px: 4,
            py: 1,
            fontWeight: 'bold',
            textTransform: 'none',
            boxShadow: mode === 'dark' ? '0 4px 12px rgba(255, 152, 0, 0.3)' : '0 2px 8px rgba(255, 152, 0, 0.2)'
          }}
        >
          Save Answer
        </Button>
      </Box>

      {/* Status indicator */}
      {answer?.answered && (
        <Alert severity="success" sx={{ mt: 2, borderRadius: '12px' }}>
          <Typography variant="body2" fontWeight="medium">
            ✓ Answer saved successfully
          </Typography>
        </Alert>
      )}
    </Box>
  );
};

// Enhanced AI-powered question type detection with advanced pattern recognition
const detectQuestionType = (question) => {
  const text = question.text?.toLowerCase() || '';
  const originalText = question.text || '';
  const hasOptions = question.options && question.options.length > 0;

  // Check for explicit type first, but validate it
  if (question.type && question.type !== 'open-ended') {
    // Validate the explicit type against the content
    if (question.type === 'multiple-choice' && (!hasOptions || question.options.length < 2)) {
      // Override incorrect type - this is likely a fill-in-blank
    } else {
      return question.type;
    }
  }

  // PRIORITY 1: Fill-in-the-blank detection (highest priority)
  const fillInPatterns = [
    /_{3,}/, // Multiple underscores (_____)
    /_{2,}/, // Two or more underscores (____)
    /\[.*?\]/, // Square brackets [answer]
    /\(.*?\)/, // Parentheses for blanks (answer)
    /\.\.\.\.\./i, // Dots (....)
    /fill.*in.*blank/i,
    /complete.*sentence/i,
    /insert.*word/i,
    /missing.*word/i,
    /blank.*space/i,
    /choose.*correct.*word/i,
    /supply.*missing/i
  ];

  const hasFillInPattern = fillInPatterns.some(pattern => pattern.test(originalText));

  // Also check for common fill-in indicators
  const fillInIndicators = [
    originalText.includes('___'),
    originalText.includes('....'),
    originalText.includes('[   ]'),
    originalText.includes('(   )'),
    originalText.includes('______'),
    /\b\w+\s+_+\s+\w+/i.test(originalText), // word ___ word pattern
    /\b_+\s+\w+/i.test(originalText), // ___ word pattern
    /\w+\s+_+\b/i.test(originalText), // word ___ pattern
  ];

  const hasBlankIndicators = fillInIndicators.some(indicator => indicator);

  // If it has fill-in patterns but also has options, it's still fill-in-blank
  if (hasFillInPattern || hasBlankIndicators) {
    return 'fill-in-blank';
  }

  // PRIORITY 2: True/False detection
  if (hasOptions && question.options.length === 2) {
    const optionTexts = question.options.map(opt => (opt.text || opt)?.toLowerCase() || '');
    const isTrueFalse = optionTexts.some(opt =>
      opt.includes('true') || opt.includes('false') ||
      opt.includes('yes') || opt.includes('no') ||
      opt.includes('correct') || opt.includes('incorrect') ||
      opt === 't' || opt === 'f' ||
      opt === 'true' || opt === 'false' ||
      opt === 'yes' || opt === 'no'
    );

    // Also check question text for true/false indicators
    const questionHasTrueFalse = /true.*false|false.*true|correct.*incorrect|yes.*no/i.test(text);

    if (isTrueFalse || questionHasTrueFalse) {
      return 'true-false';
    }
  }

  // PRIORITY 3: Multiple choice detection (must have 3+ valid options)
  if (hasOptions && question.options.length >= 3) {
    // Validate that options are meaningful (not just blanks or placeholders)
    const validOptions = question.options.filter(opt => {
      const optText = (opt.text || opt || '').trim();
      return optText.length > 0 &&
             !optText.match(/^_+$/) &&
             !optText.match(/^\.*$/) &&
             optText !== '...' &&
             optText !== '___';
    });

    if (validOptions.length >= 3) {
      return 'multiple-choice';
    }
  }

  // PRIORITY 4: Essay detection
  const essayPatterns = [
    /explain/i, /describe/i, /discuss/i, /analyze/i, /evaluate/i,
    /compare/i, /contrast/i, /justify/i, /argue/i, /elaborate/i,
    /essay/i, /paragraph/i, /detailed/i, /comprehensive/i,
    /write.*about/i, /give.*account/i, /examine/i, /assess/i
  ];

  const isEssay = essayPatterns.some(pattern => pattern.test(text)) ||
                 text.length > 300 ||
                 question.section === 'C' ||
                 originalText.length > 300;

  if (isEssay) return 'essay';

  // PRIORITY 5: Short answer detection
  const shortAnswerPatterns = [
    /what.*is/i, /who.*is/i, /when.*did/i, /where.*is/i, /how.*many/i,
    /define/i, /identify/i, /name/i, /list/i, /state/i, /mention/i,
    /give.*example/i, /provide.*example/i, /calculate/i, /find/i
  ];

  const isShortAnswer = shortAnswerPatterns.some(pattern => pattern.test(text)) ||
                       (!hasOptions && text.length < 300 && text.length > 10);

  if (isShortAnswer) return 'short-answer';

  // FALLBACK: Section-based detection with validation
  if (question.section === 'A') {
    // Section A should be multiple choice, but if no valid options, treat as fill-in
    if (hasOptions && question.options.length >= 2) {
      return 'multiple-choice';
    } else {
      return 'fill-in-blank';
    }
  }

  if (question.section === 'B') return 'short-answer';
  if (question.section === 'C') return 'essay';

  // Final fallback - analyze content one more time
  if (!hasOptions || question.options.length === 0) {
    if (originalText.includes('___') || originalText.includes('....')) {
      return 'fill-in-blank';
    }
    return 'short-answer';
  }

  return 'multiple-choice'; // Ultimate fallback
};

// Helper functions for question types
const getQuestionTypeLabel = (type, section, question = null) => {
  // Use AI detection if question object is provided
  const detectedType = question ? detectQuestionType(question) : type;

  switch (detectedType) {
    case 'multiple-choice':
      return 'Multiple Choice';
    case 'true-false':
      return 'True/False';
    case 'fill-in-blank':
      return 'Fill in the Blank';
    case 'matching':
      return 'Matching';
    case 'ordering':
      return 'Ordering';
    case 'drag-drop':
      return 'Drag & Drop';
    case 'essay':
      return 'Essay Question';
    case 'short-answer':
      return 'Short Answer';
    case 'open-ended':
      return section === 'B' ? 'Short Answer' : 'Essay Question';
    default:
      return section === 'B' ? 'Short Answer' : 'Essay Question';
  }
};

const getQuestionTypeColor = (type, section, question = null) => {
  // Use AI detection if question object is provided
  const detectedType = question ? detectQuestionType(question) : type;

  switch (detectedType) {
    case 'multiple-choice':
      return 'primary';
    case 'true-false':
      return 'success';
    case 'fill-in-blank':
      return 'warning';
    case 'matching':
      return 'info';
    case 'ordering':
      return 'secondary';
    case 'drag-drop':
      return 'error';
    case 'essay':
      return 'secondary';
    case 'short-answer':
      return 'info';
    case 'open-ended':
      return section === 'B' ? 'info' : 'secondary';
    default:
      return section === 'B' ? 'info' : 'secondary';
  }
};

// Enhanced Matching Question Component
const MatchingQuestion = ({ question, answer, onAnswerChange, disabled }) => {
  const [matches, setMatches] = useState(answer?.matchingAnswers || []);
  const [selectedLeft, setSelectedLeft] = useState(null);

  const handleMatch = (leftIndex, rightIndex) => {
    if (disabled) return;

    const newMatches = [...matches];

    // Remove any existing match for this left item
    const existingMatchIndex = newMatches.findIndex(m => m.left === leftIndex);
    if (existingMatchIndex >= 0) {
      newMatches.splice(existingMatchIndex, 1);
    }

    // Remove any existing match for this right item
    const existingRightMatchIndex = newMatches.findIndex(m => m.right === rightIndex);
    if (existingRightMatchIndex >= 0) {
      newMatches.splice(existingRightMatchIndex, 1);
    }

    // Add new match
    newMatches.push({ left: leftIndex, right: rightIndex });

    setMatches(newMatches);
    setSelectedLeft(null);
    onAnswerChange(question._id, { matchingAnswers: newMatches }, 'matching');
  };

  const handleLeftClick = (leftIndex) => {
    if (disabled) return;
    setSelectedLeft(selectedLeft === leftIndex ? null : leftIndex);
  };

  const handleRightClick = (rightIndex) => {
    if (disabled) return;
    if (selectedLeft !== null) {
      handleMatch(selectedLeft, rightIndex);
    }
  };

  const clearMatch = (matchIndex) => {
    if (disabled) return;
    const newMatches = [...matches];
    newMatches.splice(matchIndex, 1);
    setMatches(newMatches);
    onAnswerChange(question._id, { matchingAnswers: newMatches }, 'matching');
  };

  const leftColumn = question.matchingPairs?.leftColumn || [];
  const rightColumn = question.matchingPairs?.rightColumn || [];

  return (
    <Box>
      <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
        <Box component="span" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <HelpOutline sx={{ mr: 1, fontSize: 20, color: 'info.main' }} />
          Match items from Column A with items from Column B. Click an item in Column A, then click its match in Column B.
        </Box>
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Paper sx={{ p: 2, bgcolor: 'info.lighter', mb: 2 }}>
            <Typography variant="h6" gutterBottom color="info.main" fontWeight="bold">
              Column A
            </Typography>
          </Paper>
          {leftColumn.map((item, index) => {
            const isMatched = matches.find(m => m.left === index);
            const isSelected = selectedLeft === index;

            return (
              <Paper
                key={index}
                onClick={() => handleLeftClick(index)}
                sx={{
                  p: 2,
                  mb: 1,
                  cursor: disabled ? 'default' : 'pointer',
                  bgcolor: isMatched ? 'success.lighter' : isSelected ? 'primary.lighter' : 'background.paper',
                  border: '2px solid',
                  borderColor: isMatched ? 'success.main' : isSelected ? 'primary.main' : 'divider',
                  transition: 'all 0.2s ease',
                  '&:hover': disabled ? {} : {
                    transform: 'translateY(-2px)',
                    boxShadow: 2,
                    borderColor: isMatched ? 'success.dark' : 'primary.main'
                  }
                }}
              >
                <Typography variant="body1" fontWeight={isSelected ? 'bold' : 'normal'}>
                  <Chip
                    label={index + 1}
                    size="small"
                    color={isMatched ? 'success' : isSelected ? 'primary' : 'default'}
                    sx={{ mr: 1, fontWeight: 'bold' }}
                  />
                  {item}
                </Typography>
                {isMatched && (
                  <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 0.5 }}>
                    ✓ Matched with {String.fromCharCode(65 + isMatched.right)}
                  </Typography>
                )}
              </Paper>
            );
          })}
        </Grid>

        <Grid item xs={12} sm={6}>
          <Paper sx={{ p: 2, bgcolor: 'secondary.lighter', mb: 2 }}>
            <Typography variant="h6" gutterBottom color="secondary.main" fontWeight="bold">
              Column B
            </Typography>
          </Paper>
          {rightColumn.map((item, index) => {
            const isMatched = matches.find(m => m.right === index);

            return (
              <Paper
                key={index}
                onClick={() => handleRightClick(index)}
                sx={{
                  p: 2,
                  mb: 1,
                  cursor: disabled ? 'default' : selectedLeft !== null ? 'pointer' : 'not-allowed',
                  bgcolor: isMatched ? 'success.lighter' : 'background.paper',
                  border: '2px solid',
                  borderColor: isMatched ? 'success.main' : 'divider',
                  opacity: disabled ? 0.7 : selectedLeft !== null || isMatched ? 1 : 0.6,
                  transition: 'all 0.2s ease',
                  '&:hover': disabled || selectedLeft === null ? {} : {
                    transform: 'translateY(-2px)',
                    boxShadow: 2,
                    borderColor: isMatched ? 'success.dark' : 'secondary.main'
                  }
                }}
              >
                <Typography variant="body1">
                  <Chip
                    label={String.fromCharCode(65 + index)}
                    size="small"
                    color={isMatched ? 'success' : 'default'}
                    sx={{ mr: 1, fontWeight: 'bold' }}
                  />
                  {item}
                </Typography>
                {isMatched && (
                  <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 0.5 }}>
                    ✓ Matched with {isMatched.left + 1}
                  </Typography>
                )}
              </Paper>
            );
          })}
        </Grid>
      </Grid>

      {/* Instructions and Progress */}
      <Box sx={{ mt: 3 }}>
        {selectedLeft !== null && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Selected item {selectedLeft + 1} from Column A. Now click an item in Column B to create a match.
          </Alert>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Progress: {matches.length} of {Math.min(leftColumn.length, rightColumn.length)} matches completed
          </Typography>

          {matches.length > 0 && !disabled && (
            <Button
              variant="outlined"
              size="small"
              color="error"
              onClick={() => {
                setMatches([]);
                setSelectedLeft(null);
                onAnswerChange(question._id, { matchingAnswers: [] }, 'matching');
              }}
            >
              Clear All Matches
            </Button>
          )}
        </Box>

        {/* Current matches summary */}
        {matches.length > 0 && (
          <Paper sx={{ mt: 2, p: 2, bgcolor: 'success.lighter' }}>
            <Typography variant="subtitle2" gutterBottom color="success.main" fontWeight="bold">
              Your Matches:
            </Typography>
            <Grid container spacing={1}>
              {matches.map((match, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 1,
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'success.main'
                  }}>
                    <Typography variant="body2">
                      {match.left + 1} ↔ {String.fromCharCode(65 + match.right)}
                    </Typography>
                    {!disabled && (
                      <IconButton
                        size="small"
                        onClick={() => clearMatch(index)}
                        color="error"
                      >
                        ×
                      </IconButton>
                    )}
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

// Enhanced Ordering Question Component
const OrderingQuestion = ({ question, answer, onAnswerChange, disabled }) => {
  const [order, setOrder] = useState(answer?.orderingAnswer || []);
  const items = question.itemsToOrder?.items || [];

  // Initialize order if empty
  React.useEffect(() => {
    if (order.length === 0 && items.length > 0) {
      const initialOrder = items.map((_, index) => index);
      setOrder(initialOrder);
    }
  }, [items, order.length]);

  const moveItem = (fromIndex, direction) => {
    if (disabled) return;

    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= order.length) return;

    const newOrder = [...order];
    [newOrder[fromIndex], newOrder[toIndex]] = [newOrder[toIndex], newOrder[fromIndex]];

    setOrder(newOrder);
    onAnswerChange(question._id, { orderingAnswer: newOrder }, 'ordering');
  };

  const resetOrder = () => {
    if (disabled) return;
    const shuffledOrder = [...Array(items.length).keys()].sort(() => Math.random() - 0.5);
    setOrder(shuffledOrder);
    onAnswerChange(question._id, { orderingAnswer: shuffledOrder }, 'ordering');
  };

  return (
    <Box>
      <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
        <Box component="span" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <SwapVert sx={{ mr: 1, fontSize: 20, color: 'secondary.main' }} />
          Arrange the following items in the correct order. Use the arrow buttons to move items up or down.
        </Box>
      </Typography>

      <Paper sx={{ p: 2, bgcolor: 'secondary.lighter', mb: 2 }}>
        <Typography variant="h6" gutterBottom color="secondary.main" fontWeight="bold">
          Items to Order
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Current order: {order.length > 0 ? 'Custom arrangement' : 'Original order'}
        </Typography>
      </Paper>

      <List sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
        {order.map((itemIndex, position) => (
          <ListItem
            key={`${itemIndex}-${position}`}
            sx={{
              mb: 1,
              bgcolor: 'background.paper',
              border: '2px solid',
              borderColor: 'divider',
              borderRadius: 1,
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: 'secondary.main',
                boxShadow: 1
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              {/* Position indicator */}
              <Chip
                label={position + 1}
                color="secondary"
                size="small"
                sx={{ mr: 2, fontWeight: 'bold', minWidth: 40 }}
              />

              {/* Item content */}
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body1">
                  {items[itemIndex]}
                </Typography>
              </Box>

              {/* Move buttons */}
              {!disabled && (
                <Box sx={{ display: 'flex', flexDirection: 'column', ml: 2 }}>
                  <IconButton
                    size="small"
                    onClick={() => moveItem(position, 'up')}
                    disabled={position === 0}
                    color="primary"
                    sx={{ mb: 0.5 }}
                  >
                    ↑
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => moveItem(position, 'down')}
                    disabled={position === order.length - 1}
                    color="primary"
                  >
                    ↓
                  </IconButton>
                </Box>
              )}
            </Box>
          </ListItem>
        ))}
      </List>

      {/* Controls */}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Items arranged: {order.length} of {items.length}
        </Typography>

        {!disabled && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              color="secondary"
              onClick={resetOrder}
              startIcon={<SwapVert />}
            >
              Shuffle
            </Button>
            <Button
              variant="outlined"
              size="small"
              color="error"
              onClick={() => {
                const originalOrder = items.map((_, index) => index);
                setOrder(originalOrder);
                onAnswerChange(question._id, { orderingAnswer: originalOrder }, 'ordering');
              }}
            >
              Reset to Original
            </Button>
          </Box>
        )}
      </Box>

      {/* Instructions */}
      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="body2">
          <strong>How to use:</strong> Click the ↑ and ↓ arrows next to each item to move it up or down in the list.
          The numbers on the left show the current position of each item.
        </Typography>
      </Alert>
    </Box>
  );
};

// Enhanced Drag Drop Question Component
const DragDropQuestion = ({ question, answer, onAnswerChange, disabled }) => {
  const [placements, setPlacements] = useState(answer?.dragDropAnswer || []);
  const [selectedItem, setSelectedItem] = useState(null);
  const dropZones = question.dragDropData?.dropZones || [];
  const draggableItems = question.dragDropData?.draggableItems || [];

  const handleDrop = (itemIndex, zoneIndex) => {
    if (disabled) return;

    const newPlacements = placements.filter(p => p.item !== itemIndex);
    newPlacements.push({ item: itemIndex, zone: zoneIndex });

    setPlacements(newPlacements);
    setSelectedItem(null);
    onAnswerChange(question._id, { dragDropAnswer: newPlacements }, 'drag-drop');
  };

  const handleItemClick = (itemIndex) => {
    if (disabled) return;
    const isPlaced = placements.find(p => p.item === itemIndex);
    if (!isPlaced) {
      setSelectedItem(selectedItem === itemIndex ? null : itemIndex);
    }
  };

  const handleZoneClick = (zoneIndex) => {
    if (disabled || selectedItem === null) return;
    handleDrop(selectedItem, zoneIndex);
  };

  const removeFromZone = (placement) => {
    if (disabled) return;
    const newPlacements = placements.filter(p => p !== placement);
    setPlacements(newPlacements);
    onAnswerChange(question._id, { dragDropAnswer: newPlacements }, 'drag-drop');
  };

  const clearAllPlacements = () => {
    if (disabled) return;
    setPlacements([]);
    setSelectedItem(null);
    onAnswerChange(question._id, { dragDropAnswer: [] }, 'drag-drop');
  };

  return (
    <Box>
      <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
        <Box component="span" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <DragIndicator sx={{ mr: 1, fontSize: 20, color: 'error.main' }} />
          Place items in the appropriate zones. Click an item to select it, then click a zone to place it.
        </Box>
      </Typography>

      {/* Instructions */}
      {selectedItem !== null && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Selected: "{draggableItems[selectedItem]}". Now click a drop zone to place this item.
        </Alert>
      )}

      {/* Draggable Items */}
      <Paper sx={{ p: 2, bgcolor: 'error.lighter', mb: 3 }}>
        <Typography variant="h6" gutterBottom color="error.main" fontWeight="bold">
          Items to Place
        </Typography>
        <Grid container spacing={2}>
          {draggableItems.map((item, index) => {
            const isPlaced = placements.find(p => p.item === index);
            const isSelected = selectedItem === index;

            return (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Paper
                  onClick={() => handleItemClick(index)}
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    cursor: disabled ? 'default' : isPlaced ? 'not-allowed' : 'pointer',
                    opacity: isPlaced ? 0.4 : 1,
                    bgcolor: isPlaced ? 'action.disabled' : isSelected ? 'primary.lighter' : 'background.paper',
                    border: '2px solid',
                    borderColor: isPlaced ? 'action.disabled' : isSelected ? 'primary.main' : 'divider',
                    transition: 'all 0.2s ease',
                    '&:hover': disabled || isPlaced ? {} : {
                      transform: 'translateY(-2px)',
                      boxShadow: 2,
                      borderColor: 'primary.main'
                    }
                  }}
                >
                  <Typography variant="body1" fontWeight={isSelected ? 'bold' : 'normal'}>
                    <Chip
                      label={index + 1}
                      size="small"
                      color={isPlaced ? 'default' : isSelected ? 'primary' : 'error'}
                      sx={{ mr: 1, fontWeight: 'bold' }}
                    />
                    {item}
                  </Typography>
                  {isPlaced && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      ✓ Placed in: {dropZones[placements.find(p => p.item === index)?.zone]}
                    </Typography>
                  )}
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </Paper>

      {/* Drop Zones */}
      <Paper sx={{ p: 2, bgcolor: 'success.lighter', mb: 2 }}>
        <Typography variant="h6" gutterBottom color="success.main" fontWeight="bold">
          Drop Zones
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        {dropZones.map((zone, index) => {
          const placedItems = placements.filter(p => p.zone === index);
          const canDrop = selectedItem !== null && !disabled;

          return (
            <Grid item xs={12} sm={6} key={index}>
              <Paper
                onClick={() => handleZoneClick(index)}
                sx={{
                  p: 3,
                  minHeight: 120,
                  border: '3px dashed',
                  borderColor: placedItems.length > 0 ? 'success.main' : canDrop ? 'primary.main' : 'divider',
                  bgcolor: placedItems.length > 0 ? 'success.lighter' : canDrop ? 'primary.lighter' : 'background.default',
                  cursor: disabled ? 'default' : canDrop ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s ease',
                  '&:hover': disabled || !canDrop ? {} : {
                    transform: 'translateY(-2px)',
                    boxShadow: 2,
                    borderColor: 'primary.dark'
                  }
                }}
              >
                <Typography variant="subtitle1" gutterBottom fontWeight="bold" color="text.primary">
                  {zone}
                </Typography>

                {placedItems.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    {canDrop ? 'Click here to place selected item' : 'Empty zone'}
                  </Typography>
                ) : (
                  <Box>
                    {placedItems.map((placement) => (
                      <Chip
                        key={placement.item}
                        label={draggableItems[placement.item]}
                        color="success"
                        sx={{ mr: 1, mb: 1, fontWeight: 'bold' }}
                        onDelete={disabled ? undefined : () => removeFromZone(placement)}
                        deleteIcon={<span>×</span>}
                      />
                    ))}
                  </Box>
                )}
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {/* Progress and Controls */}
      <Box sx={{ mt: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Progress: {placements.length} of {draggableItems.length} items placed
          </Typography>

          {placements.length > 0 && !disabled && (
            <Button
              variant="outlined"
              size="small"
              color="error"
              onClick={clearAllPlacements}
              startIcon={<span>×</span>}
            >
              Clear All
            </Button>
          )}
        </Box>

        {/* Placement Summary */}
        {placements.length > 0 && (
          <Paper sx={{ p: 2, bgcolor: 'info.lighter' }}>
            <Typography variant="subtitle2" gutterBottom color="info.main" fontWeight="bold">
              Current Placements:
            </Typography>
            <Grid container spacing={1}>
              {placements.map((placement, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 1,
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'info.main'
                  }}>
                    <Typography variant="body2">
                      <strong>{draggableItems[placement.item]}</strong> → {dropZones[placement.zone]}
                    </Typography>
                    {!disabled && (
                      <IconButton
                        size="small"
                        onClick={() => removeFromZone(placement)}
                        color="error"
                      >
                        ×
                      </IconButton>
                    )}
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default ExamInterface;
