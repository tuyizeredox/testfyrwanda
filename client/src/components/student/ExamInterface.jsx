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
  Snackbar
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
  Security
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import api from '../../services/api';
// Import security CSS
import './ExamSecurity.css';

// Styled components for gamified UI
const QuestionCard = styled(Card)(({ theme, answered: answeredProp }) => {
  // Convert boolean prop to string to avoid React warnings
  // Remove the prop from the DOM by handling it here
  const isAnswered = answeredProp === true || answeredProp === 'true';

  return {
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    borderLeft: isAnswered ? `5px solid ${theme.palette.success.main}` : 'none',
    '&::before': isAnswered ? {
      content: '""',
      position: 'absolute',
      top: 0,
      right: 0,
      width: '30px',
      height: '30px',
      background: theme.palette.success.main,
      transform: 'rotate(45deg) translate(15px, -15px)',
      zIndex: 1
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

const TimerDisplay = styled(Box)(({ theme, warning }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(1, 2),
  borderRadius: 0, // Remove rounded corners
  backgroundColor: warning
    ? warning === 'danger'
      ? theme.palette.error.main
      : theme.palette.warning.main
    : theme.palette.primary.main,
  color: 'white',
  fontWeight: 'bold',
  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
  animation: warning === 'danger' ? 'pulse 1s infinite' : 'none',
  '@keyframes pulse': {
    '0%': {
      boxShadow: '0 0 0 0 rgba(213, 0, 0, 0.7)'
    },
    '70%': {
      boxShadow: '0 0 0 10px rgba(213, 0, 0, 0)'
    },
    '100%': {
      boxShadow: '0 0 0 0 rgba(213, 0, 0, 0)'
    }
  }
}));

const SectionChip = styled(Chip)(({ theme, active: activeProp }) => {
  // Convert boolean prop to string to avoid React warnings
  // Remove the prop from the DOM by handling it here
  const isActive = activeProp === true || activeProp === 'true';

  return {
    fontWeight: 'bold',
    backgroundColor: isActive ? theme.palette.primary.main : theme.palette.grey[300],
    color: isActive ? 'white' : theme.palette.text.primary,
    '&:hover': {
      backgroundColor: isActive ? theme.palette.primary.dark : theme.palette.grey[400],
    },
    transition: 'all 0.3s ease',
    transform: isActive ? 'scale(1.05)' : 'scale(1)',
    boxShadow: isActive ? '0 4px 8px rgba(0, 0, 0, 0.2)' : 'none',
  };
});

// Main component
const ExamInterface = () => {
  const { id } = useParams();
  const navigate = useNavigate();

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

  // Handle exam submission - defined at the top to avoid reference errors
  const handleSubmitExam = useCallback(async () => {
    try {
      setSubmitting(true);

      // Show submitting message
      setSnackbar({
        open: true,
        message: 'Preparing to submit your exam...',
        severity: 'info'
      });

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

        // Save each unsaved answer
        for (const [questionId, answer] of unsavedAnswers) {
          try {
            // Find the question type
            const question = exam?.sections
              .flatMap(section => section.questions)
              .find(q => q._id === questionId);

            if (question) {
              await saveAnswerToServer(questionId, answer.textAnswer, question.type);
            }
          } catch (error) {
            console.error(`Error saving answer ${questionId} before submission:`, error);
            // Continue with other answers even if one fails
          }
        }
      }

      // Now submit the exam
      setSnackbar({
        open: true,
        message: 'Submitting your exam...',
        severity: 'info'
      });

      console.log(`Submitting exam ${id} for completion`);

      // Add retry logic for exam submission
      let retries = 2;
      let success = false;
      let response = null;

      while (retries > 0 && !success) {
        try {
          response = await api.post(`/exam/${id}/complete`);
          success = true;
          console.log('Exam submitted successfully:', response.data);
        } catch (submitError) {
          console.warn(`Exam submission attempt failed, retries left: ${retries}`, submitError);
          retries--;
          if (retries === 0) throw submitError;
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      setExamCompleted(true);
      setExamResult(response.data);
      setSubmitting(false);

      // Show success message
      setSnackbar({
        open: true,
        message: 'Exam submitted successfully!',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error submitting exam:', err);

      setSubmitting(false);

      // Show error message
      setSnackbar({
        open: true,
        message: 'Failed to submit exam. Please try again.',
        severity: 'error'
      });

      // Don't set error state unless it's a critical error
      // This allows the user to try submitting again
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

        // Log exam data to help diagnose issues
        console.log('Exam data received:', {
          id: examRes.data._id,
          title: examRes.data.title,
          sections: examRes.data.sections?.map(s => ({
            name: s.name,
            description: s.description,
            questionCount: s.questions?.length || 0
          })),
          totalQuestions: examRes.data.sections?.reduce((total, section) =>
            total + (section.questions?.length || 0), 0) || 0
        });

        setExam(examRes.data);

        // Initialize selective answering based on exam configuration
        console.log('Selective answering config:', {
          allowSelectiveAnswering: examRes.data.allowSelectiveAnswering,
          sectionBRequiredQuestions: examRes.data.sectionBRequiredQuestions,
          sectionCRequiredQuestions: examRes.data.sectionCRequiredQuestions
        });
        setSelectiveAnswering(examRes.data.allowSelectiveAnswering || false);

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
              // Use the saved selection state if available
              isSelected = answer.isSelected;
              console.log(`Using saved selection state for question ${answer.question._id}: ${isSelected}`);
            } else if (selectiveAnswering && (questionSection === 'B' || questionSection === 'C')) {
              // Get all questions in this section
              const sectionQuestions = examRes.data.sections
                .find(s => s.name === questionSection)
                ?.questions || [];

              // Get required questions count for this section
              const requiredCount = questionSection === 'B'
                ? (examRes.data.sectionBRequiredQuestions || 3)
                : (examRes.data.sectionCRequiredQuestions || 1);

              // Get the index of this question in its section
              const questionIndexInSection = sectionQuestions.findIndex(q => q._id === answer.question._id);

              // Select only the first N questions by default
              isSelected = questionIndexInSection < requiredCount;

              console.log(`Question ${answer.question._id} in section ${questionSection} is ${isSelected ? 'selected' : 'not selected'} by default (index ${questionIndexInSection}, required ${requiredCount})`);
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

              // For sections B and C with selective answering, default to selected for the first N questions
              // where N is the required number of questions for that section
              let isSelected = true;

              if (selectiveAnswering && (questionSection === 'B' || questionSection === 'C')) {
                // Get all questions in this section
                const sectionQuestions = examRes.data.sections
                  .find(s => s.name === questionSection)
                  ?.questions || [];

                // Get required questions count for this section
                const requiredCount = questionSection === 'B'
                  ? (examRes.data.sectionBRequiredQuestions || 3)
                  : (examRes.data.sectionCRequiredQuestions || 1);

                // Get the index of this question in its section
                const questionIndexInSection = sectionQuestions.findIndex(q => q._id === answer.question._id);

                // Select only the first N questions by default
                isSelected = questionIndexInSection < requiredCount;

                console.log(`Question ${answer.question._id} in section ${questionSection} is ${isSelected ? 'selected' : 'not selected'} by default (index ${questionIndexInSection}, required ${requiredCount})`);
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

    console.log('Activating exam security measures');

    // Activate security measures
    setSecurityActive(true);

    // Show the fullscreen prompt immediately if not in fullscreen mode
    if (!hasRequestedFullscreen.current && !isFullscreen) {
      console.log('Showing fullscreen prompt immediately');
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
      console.warn('Exam has no sections');
      return [];
    }

    const section = exam.sections.find(s => s.name === activeSection);
    if (!section) {
      console.warn(`Section ${activeSection} not found`);
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

  // Debug function to log exam configuration
  useEffect(() => {
    if (exam) {
      console.log('Exam configuration:', {
        id: exam._id,
        title: exam.title,
        allowSelectiveAnswering: exam.allowSelectiveAnswering,
        sectionBRequiredQuestions: exam.sectionBRequiredQuestions,
        sectionCRequiredQuestions: exam.sectionCRequiredQuestions
      });
    }
  }, [exam]);

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
        console.warn(`Section ${section} has no questions, not changing to it`);
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

  // Handle answer change
  const handleAnswerChange = (questionId, value, type) => {
    // Don't allow changing already submitted answers
    if (answers[questionId]?.answered && answers[questionId]?.savedToServer) {
      return;
    }

    // For multiple-choice questions, save immediately
    if (type === 'multiple-choice') {
      // Update local state
      setAnswers(prev => ({
        ...prev,
        [questionId]: {
          ...prev[questionId],
          selectedOption: value,
          answered: true,
          savedToServer: false // Mark that it needs to be saved
        }
      }));

      // Submit answer to server immediately for multiple choice
      saveAnswerToServer(questionId, value, type);
      return;
    }

    // For essay questions, just update local state without saving to server
    // No character limit restrictions - any length is valid
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        textAnswer: value,
        // Don't mark as answered until explicitly saved
        answered: prev[questionId]?.answered || false,
        savedToServer: false, // Mark that it needs to be saved
        hasChanges: true // Flag to indicate unsaved changes
      }
    }));
  };

  // Function to save answer to server
  const saveAnswerToServer = async (questionId, value, type) => {
    try {
      // Get the current question
      const question = exam.sections
        .flatMap(section => section.questions)
        .find(q => q._id === questionId);

      if (!question) {
        console.error(`Question ${questionId} not found`);
        return;
      }

      console.log(`Submitting answer for question ${questionId}`);

      // Show saving indicator
      setSnackbar({
        open: true,
        message: 'Saving your answer...',
        severity: 'info'
      });

      // Add error handling and retry logic
      let retries = 2;
      let success = false;

      while (retries > 0 && !success) {
        try {
          await api.post(`/exam/${id}/answer`, {
            questionId,
            [type === 'multiple-choice' ? 'selectedOption' : 'textAnswer']: value
          });
          success = true;
          console.log(`Answer submitted successfully for question ${questionId}`);
        } catch (submitError) {
          console.warn(`Attempt failed, retries left: ${retries}`, submitError);
          retries--;
          if (retries === 0) throw submitError;
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      // Show success message
      setSnackbar({
        open: true,
        message: 'Answer saved successfully',
        severity: 'success'
      });

      // Update local state to mark as saved to server
      setAnswers(prev => ({
        ...prev,
        [questionId]: {
          ...prev[questionId],
          answered: true,
          savedToServer: true,
          hasChanges: false
        }
      }));
    } catch (err) {
      console.error('Error submitting answer:', err);

      // Show error message to user
      setSnackbar({
        open: true,
        message: 'Failed to save answer. Your progress is saved locally.',
        severity: 'warning'
      });

      // Don't revert the local state - keep the answer locally even if server save fails
      // This way the student doesn't lose their work
      setAnswers(prev => ({
        ...prev,
        [questionId]: {
          ...prev[questionId],
          savedToServer: false,
          hasChanges: true
        }
      }));
    }
  };



  // Handle question selection for sections B and C
  const handleQuestionSelection = async (questionId) => {
    if (!selectiveAnswering) return;

    // Find the question in the exam
    const question = exam.sections
      .flatMap(section => section.questions)
      .find(q => q._id === questionId);

    if (!question) {
      console.error(`Question ${questionId} not found in exam`);
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

    // Get all questions in this section
    const sectionQuestions = exam.sections
      .find(s => s.name === question.section)
      ?.questions || [];

    // Toggle selection
    const newIsSelected = !selectedQuestions[questionId];

    // Count currently selected questions in this section (excluding the current question if we're deselecting)
    const selectedInSection = sectionQuestions
      .filter(q => q._id !== questionId ? selectedQuestions[q._id] : newIsSelected)
      .length;

    // Get required questions count for this section with fallbacks
    const requiredCount = question.section === 'B'
      ? (exam.sectionBRequiredQuestions || 3)
      : (exam.sectionCRequiredQuestions || 1);

    console.log(`Selection check: ${selectedInSection} selected in section ${question.section}, ${requiredCount} required`);

    // Check if we're trying to deselect when we're at the minimum
    if (!newIsSelected && selectedInSection < requiredCount) {
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
      console.log(`Sending selection update to server: Question ${questionId} in section ${question.section} to ${newIsSelected ? 'selected' : 'deselected'}`);

      const response = await api.post(`/exam/${id}/select-question`, {
        questionId,
        isSelected: newIsSelected
      });

      console.log('Server response:', response.data);

      // Show success message
      setSnackbar({
        open: true,
        message: newIsSelected
          ? `Question added to your selection`
          : `Question removed from your selection`,
        severity: 'success'
      });

      console.log(`Question selection updated: Question ${questionId} is now ${newIsSelected ? 'selected' : 'deselected'}`);
    } catch (error) {
      console.error('Error updating question selection:', error);

      // Revert the change if the server update fails
      setSelectedQuestions(prev => ({
        ...prev,
        [questionId]: !newIsSelected
      }));

      // Show error message with detailed server message if available
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to update question selection',
        severity: 'error'
      });
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
    <Container
      maxWidth="lg"
      sx={{ mt: 4, mb: 4 }}
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
          <Typography variant="body2" sx={{ mt: 1, fontWeight: 'medium' }}>
            To select/deselect questions: Hold SHIFT and click on a question number, or right-click on a question number.
          </Typography>
        </Paper>
      )}

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
          <Typography variant="body2" sx={{ mt: 1, fontWeight: 'medium' }}>
            To select/deselect questions: Hold SHIFT and click on a question number, or right-click on a question number.
          </Typography>
        </Paper>
      )}

      {/* Exam Header */}
      <Paper
        elevation={3}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 0, // Remove rounded corners
          position: 'relative',
          overflow: 'hidden'
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
          <Paper elevation={2} sx={{ p: 2, borderRadius: 0 }}>
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
                const isSelected = !isSelectiveSection || selectedQuestions[question._id];

                // Determine chip color based on selection and answer status
                let chipColor = 'default';
                if (answers[question._id]?.answered) {
                  chipColor = 'success';
                } else if (isSelectiveSection) {
                  chipColor = isSelected ? 'primary' : 'default';
                }

                return (
                  <Tooltip
                    key={question._id}
                    title={isSelectiveSection
                      ? isSelected
                        ? "Selected for answering (Shift+click or right-click to deselect)"
                        : "Not selected (Shift+click or right-click to select)"
                      : "Required question"}
                    arrow
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
                      variant={activeQuestionIndex === index ? 'filled' : 'outlined'}
                      icon={isSelectiveSection
                        ? isSelected
                          ? <CheckCircle fontSize="small" color="success" />
                          : <RadioButtonUnchecked fontSize="small" color="disabled" />
                        : null}
                      sx={{
                        minWidth: 40,
                        fontWeight: 'bold',
                        transition: 'all 0.2s ease',
                        transform: activeQuestionIndex === index ? 'scale(1.1)' : 'scale(1)',
                        ...(isSelectiveSection && !isSelected && {
                          opacity: 0.6,
                          border: '1px dashed',
                          textDecoration: 'line-through',
                        }),
                        ...(isSelectiveSection && {
                          cursor: 'pointer',
                          '&:hover': {
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                            transform: 'translateY(-2px)'
                          }
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
                    bgcolor: 'background.paper',
                    borderRadius: '4px',
                    border: '1px solid',
                    borderColor: 'primary.light',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
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
                    </Box>
                  )}

                  {/* Debug information - only visible during development */}
                  {process.env.NODE_ENV === 'development' && (
                    <Box sx={{ mt: 2, p: 1, bgcolor: 'grey.100', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                      <Typography variant="caption" component="div" sx={{ fontWeight: 'bold' }}>
                        Debug Info (only visible in development):
                      </Typography>
                      <Typography variant="caption" component="div">
                        Section: {activeSection} |
                        Questions: {getCurrentSectionQuestions().length} |
                        Current Question Index: {activeQuestionIndex}
                      </Typography>
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
                              ? "Selected for answering"
                              : "Not selected (click to select)"}
                            color={selectedQuestions[currentQuestion._id] ? "success" : "default"}
                            size="small"
                            onClick={() => handleQuestionSelection(currentQuestion._id)}
                            sx={{
                              cursor: 'pointer',
                              fontWeight: 'medium',
                              '&:hover': {
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                transform: 'translateY(-2px)'
                              }
                            }}
                          />
                        )}
                        <Chip
                          label={
                            currentQuestion.type === 'multiple-choice'
                              ? 'Multiple Choice'
                              : currentQuestion.section === 'B'
                                ? 'Short Answer'
                                : 'Essay Question'
                          }
                          color={
                            currentQuestion.type === 'multiple-choice'
                              ? 'primary'
                              : currentQuestion.section === 'B'
                                ? 'info'
                                : 'secondary'
                          }
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
                          Type: {currentQuestion.type === 'multiple-choice' ? 'Multiple Choice' : 'Open-ended'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Points: {currentQuestion.points || 1}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ mt: 4 }}>
                      {currentQuestion.type === 'multiple-choice' ? (
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
                      ) : (
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
                      )}
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
  );
};

export default ExamInterface;
