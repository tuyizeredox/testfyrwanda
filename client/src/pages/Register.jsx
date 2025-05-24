import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Avatar,
  Link,
  Grid,
  InputAdornment,
  IconButton,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Toolbar,
  useTheme,
  StepConnector,
  styled,
  Fade,
  Zoom,
  alpha,
  useMediaQuery,
  Card,
  CardContent,
  Snackbar,
  CircularProgress,
  LinearProgress
} from '@mui/material';
import {
  School,
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  Business,
  Phone,
  HowToReg,
  CheckCircle,
  ArrowForward,
  ArrowBack,
  ErrorOutline,
  WarningAmber,
  InfoOutlined
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../context/ThemeContext';
import AuthHeader from '../components/AuthHeader';
import AuthFooter from '../components/AuthFooter';

const steps = ['Account Information', 'Personal Details', 'Complete'];

// Custom styled step connector
const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
  [`&.MuiStepConnector-alternativeLabel`]: {
    top: 22,
  },
  [`&.MuiStepConnector-active`]: {
    [`& .MuiStepConnector-line`]: {
      backgroundImage: `linear-gradient(95deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`,
    },
  },
  [`&.MuiStepConnector-completed`]: {
    [`& .MuiStepConnector-line`]: {
      backgroundImage: `linear-gradient(95deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`,
    },
  },
  [`& .MuiStepConnector-line`]: {
    height: 3,
    border: 0,
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#eaeaf0',
    borderRadius: 1,
  },
}));

// Custom styled step icon
const ColorlibStepIconRoot = styled('div')(({ theme, ownerState }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#ccc',
  zIndex: 1,
  color: '#fff',
  width: 50,
  height: 50,
  display: 'flex',
  borderRadius: '50%',
  justifyContent: 'center',
  alignItems: 'center',
  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
  border: '3px solid #fff',
  transition: 'all 0.3s ease',
  ...(ownerState.active && {
    backgroundImage: `linear-gradient(136deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`,
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
    transform: 'scale(1.1)',
  }),
  ...(ownerState.completed && {
    backgroundImage: `linear-gradient(136deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`,
  }),
}));

function ColorlibStepIcon(props) {
  const { active, completed, className } = props;

  const icons = {
    1: <Email fontSize="small" />,
    2: <Person fontSize="small" />,
    3: <CheckCircle fontSize="small" />,
  };

  return (
    <ColorlibStepIconRoot ownerState={{ completed, active }} className={className}>
      {icons[String(props.icon)]}
    </ColorlibStepIconRoot>
  );
}

const Register = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [institution, setInstitution] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  const [registrationProgress, setRegistrationProgress] = useState(0);
  const [validationErrors, setValidationErrors] = useState({});

  const { register } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const { mode } = useThemeMode();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Animation timing
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const validateStep = (step) => {
    const errors = {};

    if (step === 0) {
      // Email validation
      if (!email) {
        errors.email = 'Email is required';
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          errors.email = 'Please enter a valid email address';
        }
      }

      // Password validation
      if (!password) {
        errors.password = 'Password is required';
      } else if (password.length < 6) {
        errors.password = 'Password must be at least 6 characters long';
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
        errors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
      }

      // Confirm password validation
      if (!confirmPassword) {
        errors.confirmPassword = 'Please confirm your password';
      } else if (password !== confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    } else if (step === 1) {
      // Name validation
      if (!firstName) {
        errors.firstName = 'First name is required';
      } else if (firstName.length < 2) {
        errors.firstName = 'First name must be at least 2 characters long';
      }

      if (!lastName) {
        errors.lastName = 'Last name is required';
      } else if (lastName.length < 2) {
        errors.lastName = 'Last name must be at least 2 characters long';
      }

      // Phone validation (optional but if provided, should be valid)
      if (phone && !/^\+?[\d\s\-\(\)]{10,}$/.test(phone)) {
        errors.phone = 'Please enter a valid phone number';
      }
    }

    return errors;
  };

  const handleNext = () => {
    const errors = validateStep(activeStep);
    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      const errorMessages = Object.values(errors);
      setError(errorMessages[0]);
      setSnackbar({
        open: true,
        message: `Please fix the errors before continuing`,
        severity: 'warning'
      });
      return;
    }

    setError('');
    setValidationErrors({});
    setSnackbar({
      open: true,
      message: activeStep === 0 ? 'Account details validated!' : 'Personal details validated!',
      severity: 'success'
    });

    setTimeout(() => {
      setActiveStep((prevStep) => prevStep + 1);
    }, 500);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous errors
    setError('');
    setValidationErrors({});
    setSnackbar({ open: false, message: '', severity: 'info' });

    // Final validation
    const step0Errors = validateStep(0);
    const step1Errors = validateStep(1);
    const allErrors = { ...step0Errors, ...step1Errors };

    if (Object.keys(allErrors).length > 0) {
      setValidationErrors(allErrors);
      setError('Please fix all validation errors before submitting');
      setSnackbar({
        open: true,
        message: 'Please review and fix the errors',
        severity: 'error'
      });
      setActiveStep(0); // Go back to first step to fix errors
      return;
    }

    setLoading(true);
    setRegistrationProgress(0);

    try {
      // Send all required fields to the register function
      const user = await register({
        email,
        password,
        firstName,
        lastName,
        institution,
        phone
      });

      // Show success message immediately
      setSnackbar({
        open: true,
        message: `Welcome to Testify, ${firstName}! Account created successfully.`,
        severity: 'success'
      });

      // Quick progress animation for success
      setRegistrationProgress(100);

      // Redirect quickly after success
      setTimeout(() => {
        navigate('/admin');
      }, 1200);

    } catch (err) {
      console.error('Registration error:', err);
      setRegistrationProgress(0);

      // Immediately show error message without delay
      let errorMessage = 'Failed to create account. Please try again.';
      let snackbarMessage = 'Registration failed';

      if (err.response) {
        // Server responded with error status
        switch (err.response.status) {
          case 400:
            errorMessage = 'Invalid registration data. Please check your information and try again.';
            snackbarMessage = 'Invalid data - Please check your information';
            break;
          case 409:
            errorMessage = 'An account with this email already exists. Please use a different email or try logging in.';
            snackbarMessage = 'Email already exists - Please use a different email';
            break;
          case 422:
            errorMessage = 'Please check your input data. Some fields may contain invalid information.';
            snackbarMessage = 'Validation error - Please check your input';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later or contact support.';
            snackbarMessage = 'Server error - Please try again later';
            break;
          default:
            errorMessage = err.response.data?.message || errorMessage;
            snackbarMessage = 'Registration failed';
        }
      } else if (err.request) {
        // Network error
        errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
        snackbarMessage = 'Connection failed - Check your internet connection';
      } else if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        // Timeout error
        errorMessage = 'Request timed out. The server may be slow or unavailable.';
        snackbarMessage = 'Request timeout';
      } else {
        // Other error
        errorMessage = err.message || errorMessage;
        snackbarMessage = 'Registration failed';
      }

      // Show error immediately
      setError(errorMessage);
      setSnackbar({
        open: true,
        message: snackbarMessage,
        severity: 'error'
      });

      // Go back to first step to allow user to fix issues
      setActiveStep(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const getSnackbarIcon = (severity) => {
    switch (severity) {
      case 'success':
        return <CheckCircle />;
      case 'error':
        return <ErrorOutline />;
      case 'warning':
        return <WarningAmber />;
      case 'info':
      default:
        return <InfoOutlined />;
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!validationErrors.email}
              helperText={validationErrors.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="primary" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!validationErrors.password}
              helperText={validationErrors.password || 'Must contain uppercase, lowercase, and number'}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="primary" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              id="confirmPassword"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={!!validationErrors.confirmPassword}
              helperText={validationErrors.confirmPassword}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="primary" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 3,
                mt: 1,
                textAlign: 'center',
                fontStyle: 'italic'
              }}
            >
              All fields marked with * are required
            </Typography>
          </>
        );
      case 1:
        return (
          <>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="firstName"
                  label="First Name"
                  name="firstName"
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  error={!!validationErrors.firstName}
                  helperText={validationErrors.firstName}
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
                  margin="normal"
                  required
                  fullWidth
                  id="lastName"
                  label="Last Name"
                  name="lastName"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  error={!!validationErrors.lastName}
                  helperText={validationErrors.lastName}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>

            <TextField
              margin="normal"
              fullWidth
              id="institution"
              label="Institution/School"
              name="institution"
              autoComplete="organization"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Business color="primary" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            <TextField
              margin="normal"
              fullWidth
              id="phone"
              label="Phone Number"
              name="phone"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              error={!!validationErrors.phone}
              helperText={validationErrors.phone || 'Optional - Include country code if international'}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone color="primary" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />
          </>
        );
      case 2:
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Box
              sx={{
                position: 'relative',
                width: 120,
                height: 120,
                mx: 'auto',
                mb: 4,
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${theme.palette.success.light}, ${theme.palette.success.main})`,
                  animation: 'pulse 2s infinite',
                  opacity: 0.2,
                  '@keyframes pulse': {
                    '0%': {
                      transform: 'scale(1)',
                      opacity: 0.2,
                    },
                    '50%': {
                      transform: 'scale(1.3)',
                      opacity: 0.1,
                    },
                    '100%': {
                      transform: 'scale(1)',
                      opacity: 0.2,
                    },
                  },
                }}
              />
              <Avatar
                sx={{
                  bgcolor: 'success.main',
                  width: 120,
                  height: 120,
                  boxShadow: '0 12px 24px rgba(0, 0, 0, 0.2)',
                  border: '6px solid rgba(255, 255, 255, 0.9)',
                }}
              >
                <CheckCircle sx={{ fontSize: 60 }} />
              </Avatar>
            </Box>

            <Typography
              variant="h3"
              gutterBottom
              fontWeight="bold"
              sx={{
                background: `linear-gradient(45deg, ${theme.palette.success.dark}, ${theme.palette.success.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2
              }}
            >
              Registration Complete!
            </Typography>

            <Typography
              variant="body1"
              color="text.secondary"
              paragraph
              sx={{
                maxWidth: 500,
                mx: 'auto',
                mb: 5,
                fontSize: '1.1rem',
                lineHeight: 1.6,
                fontWeight: 500
              }}
            >
              Your account has been created successfully. You can now log in to access Testify and start exploring our platform.
            </Typography>

            <Button
              variant="contained"
              color="success"
              onClick={() => navigate('/login')}
              size="large"
              sx={{
                mt: 2,
                fontWeight: 'bold',
                py: 2,
                px: 6,
                fontSize: '1.1rem',
                borderRadius: '50px',
                boxShadow: '0 10px 25px rgba(76, 175, 80, 0.3)',
                background: `linear-gradient(45deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 15px 30px rgba(76, 175, 80, 0.4)',
                  transform: 'translateY(-3px) scale(1.05)',
                  background: `linear-gradient(45deg, ${theme.palette.success.dark}, ${theme.palette.success.main})`,
                }
              }}
            >
              Go to Login
            </Button>
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: mode === 'dark'
          ? `linear-gradient(135deg, ${alpha(theme.palette.primary.darker || '#1a1a1a', 0.9)} 0%, ${alpha(theme.palette.primary.dark, 0.8)} 100%)`
          : `linear-gradient(135deg, ${theme.palette.primary.lighter || '#f0f7ff'} 0%, ${theme.palette.primary.light} 100%)`,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: mode === 'dark'
            ? 'url(https://www.transparenttextures.com/patterns/dark-geometric.png)'
            : 'url(https://www.transparenttextures.com/patterns/cubes.png)',
          opacity: mode === 'dark' ? 0.15 : 0.1,
          zIndex: 1,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 80% 20%, ${alpha(theme.palette.secondary.main, 0.15)}, transparent 25%),
                      radial-gradient(circle at 20% 80%, ${alpha(theme.palette.primary.light, 0.15)}, transparent 25%)`,
          zIndex: 1,
        }
      }}
    >
      <AuthHeader title="Create Account" />
      <Toolbar /> {/* Spacer for fixed header */}

      <Container
        component="main"
        maxWidth="md"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          py: { xs: 3, sm: 4, md: 6 },
          px: { xs: 2, sm: 3, md: 4 },
          position: 'relative',
          zIndex: 2,
          width: '100%'
        }}
      >
        <Fade in={true} timeout={800}>
          <Paper
            elevation={mode === 'dark' ? 8 : 24}
            sx={{
              p: { xs: 2, sm: 3, md: 5 },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              borderRadius: { xs: 4, md: 8 },
              position: 'relative',
              overflow: 'hidden',
              boxShadow: mode === 'dark'
                ? `0 20px 80px ${alpha(theme.palette.common.black, 0.5)}`
                : '0 20px 80px rgba(0, 0, 0, 0.3)',
              background: mode === 'dark'
                ? alpha(theme.palette.background.paper, 0.85)
                : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(
                mode === 'dark' ? theme.palette.common.white : theme.palette.primary.main,
                mode === 'dark' ? 0.05 : 0.1
              )}`,
              width: '100%',
              maxWidth: '100%',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '8px',
                background: `linear-gradient(90deg, ${theme.palette.secondary.main}, ${theme.palette.primary.light})`,
              }
            }}
          >
          {/* Decorative elements */}
          <Zoom in={true} style={{ transitionDelay: '100ms' }}>
            <Box
              sx={{
                position: 'absolute',
                top: -50,
                left: -50,
                width: 150,
                height: 150,
                borderRadius: '50%',
                background: mode === 'dark'
                  ? `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`
                  : `linear-gradient(45deg, ${alpha(theme.palette.primary.light, 0.15)}, ${alpha(theme.palette.secondary.light, 0.15)})`,
                zIndex: 0,
                filter: 'blur(10px)',
              }}
            />
          </Zoom>

          <Zoom in={true} style={{ transitionDelay: '200ms' }}>
            <Box
              sx={{
                position: 'absolute',
                bottom: -80,
                right: -80,
                width: 200,
                height: 200,
                borderRadius: '50%',
                background: mode === 'dark'
                  ? `linear-gradient(45deg, ${alpha(theme.palette.secondary.main, 0.1)}, ${alpha(theme.palette.primary.main, 0.1)})`
                  : `linear-gradient(45deg, ${alpha(theme.palette.secondary.light, 0.15)}, ${alpha(theme.palette.primary.light, 0.15)})`,
                zIndex: 0,
                filter: 'blur(10px)',
              }}
            />
          </Zoom>

          {activeStep < 2 && (
            <Zoom in={true} style={{ transitionDelay: '300ms' }}>
              <Avatar
                sx={{
                  m: 1,
                  bgcolor: mode === 'dark' ? 'secondary.dark' : 'secondary.main',
                  width: { xs: 60, sm: 70, md: 80 },
                  height: { xs: 60, sm: 70, md: 80 },
                  boxShadow: mode === 'dark'
                    ? `0 8px 25px ${alpha(theme.palette.common.black, 0.5)}`
                    : '0 8px 25px rgba(255, 109, 0, 0.4)',
                  mb: 3,
                  zIndex: 1,
                  border: mode === 'dark'
                    ? `4px solid ${alpha(theme.palette.common.white, 0.1)}`
                    : '4px solid rgba(255, 255, 255, 0.8)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.05) rotate(5deg)',
                    boxShadow: mode === 'dark'
                      ? `0 12px 30px ${alpha(theme.palette.common.black, 0.6)}`
                      : '0 12px 30px rgba(255, 109, 0, 0.5)',
                  }
                }}
              >
                <HowToReg sx={{ fontSize: { xs: 30, sm: 35, md: 40 } }} />
              </Avatar>
            </Zoom>
          )}

          {activeStep < 2 && (
            <Zoom in={true} style={{ transitionDelay: '400ms' }}>
              <Typography
                component="h1"
                variant={{ xs: 'h4', sm: 'h3', md: 'h3' }}
                fontWeight="bold"
                sx={{
                  mb: 1,
                  background: mode === 'dark'
                    ? `linear-gradient(45deg, ${theme.palette.primary.light}, ${theme.palette.secondary.light})`
                    : `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.5px',
                  fontSize: { xs: '1.75rem', sm: '2.25rem', md: '3rem' },
                  textAlign: 'center',
                  textShadow: mode === 'dark' ? '0 2px 10px rgba(255,255,255,0.1)' : '0 2px 10px rgba(0,0,0,0.1)',
                }}
              >
                Create Your Account
              </Typography>
            </Zoom>
          )}

          {activeStep < 2 && (
            <Zoom in={true} style={{ transitionDelay: '500ms' }}>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{
                  mb: 4,
                  textAlign: 'center',
                  maxWidth: 600,
                  fontWeight: 500,
                  px: { xs: 1, sm: 2, md: 3 },
                  fontSize: { xs: '0.875rem', sm: '1rem', md: '1rem' },
                  opacity: 0.9
                }}
              >
                Join Testify to access AI-powered exam grading and comprehensive education management tools
              </Typography>
            </Zoom>
          )}

          <Stepper
            activeStep={activeStep}
            alternativeLabel
            sx={{
              width: '100%',
              mb: 5,
              '& .MuiStepLabel-label': {
                mt: 1,
                fontWeight: 500,
                fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' }
              },
              '& .MuiStepLabel-label.Mui-active': {
                fontWeight: 'bold',
                color: theme.palette.primary.main
              },
              '& .MuiStepLabel-label.Mui-completed': {
                fontWeight: 'bold',
                color: theme.palette.success.main
              },
              '& .MuiStepIcon-root': {
                fontSize: { xs: 24, sm: 28, md: 32 }
              }
            }}
            connector={<ColorlibConnector />}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel StepIconComponent={ColorlibStepIcon}>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert
              severity="error"
              sx={{
                width: '100%',
                mb: 3,
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(211, 47, 47, 0.2)'
              }}
            >
              {error}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              width: '100%',
              position: 'relative',
              zIndex: 1
            }}
          >
            {getStepContent(activeStep)}

            {activeStep < 2 && (
              <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                mt: 4
              }}>
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  variant="outlined"
                  sx={{
                    borderRadius: '50px',
                    px: { xs: 3, sm: 4 },
                    py: 1.5,
                    fontWeight: 500,
                    borderWidth: '2px',
                    transition: 'all 0.3s ease',
                    mb: { xs: 2, sm: 0 },
                    width: { xs: '100%', sm: 'auto' },
                    '&:not(:disabled)': {
                      '&:hover': {
                        borderWidth: '2px',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 15px rgba(0, 0, 0, 0.1)',
                      }
                    }
                  }}
                >
                  Back
                </Button>
                <Box sx={{ flex: '1 1 auto', display: { xs: 'none', sm: 'block' } }} />
                {activeStep === steps.length - 2 ? (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <HowToReg />}
                    sx={{
                      borderRadius: '50px',
                      px: { xs: 3, sm: 4, md: 5 },
                      py: 1.5,
                      fontWeight: 'bold',
                      fontSize: { xs: '0.9rem', sm: '1rem' },
                      boxShadow: '0 10px 25px rgba(74, 20, 140, 0.3)',
                      background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                      transition: 'all 0.3s ease',
                      width: { xs: '100%', sm: 'auto' },
                      '&:hover': {
                        boxShadow: '0 15px 30px rgba(74, 20, 140, 0.4)',
                        transform: 'translateY(-2px)',
                        background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                      },
                      '&.Mui-disabled': {
                        background: alpha(theme.palette.primary.main, 0.6),
                      }
                    }}
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleNext}
                    sx={{
                      borderRadius: '50px',
                      px: { xs: 3, sm: 4, md: 5 },
                      py: 1.5,
                      fontWeight: 'bold',
                      fontSize: { xs: '0.9rem', sm: '1rem' },
                      boxShadow: '0 10px 25px rgba(74, 20, 140, 0.3)',
                      background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                      transition: 'all 0.3s ease',
                      width: { xs: '100%', sm: 'auto' },
                      '&:hover': {
                        boxShadow: '0 15px 30px rgba(74, 20, 140, 0.4)',
                        transform: 'translateY(-2px)',
                        background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                      }
                    }}
                  >
                    Next
                  </Button>
                )}
              </Box>
            )}
          </Box>

          {/* Progress indicator for registration */}
          {loading && (
            <Fade in={loading}>
              <Box sx={{ width: '100%', mt: 3, mb: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={registrationProgress}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: alpha(theme.palette.primary.main, 0.2),
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    }
                  }}
                />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', textAlign: 'center', mt: 1, fontWeight: 500 }}
                >
                  {registrationProgress < 30 ? 'Creating account...' :
                   registrationProgress < 60 ? 'Validating details...' :
                   registrationProgress < 90 ? 'Setting up profile...' :
                   'Almost ready...'}
                </Typography>
              </Box>
            </Fade>
          )}

          {activeStep === 0 && (
            <Zoom in={true} style={{ transitionDelay: '1000ms' }}>
              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ fontWeight: 500 }}
                >
                  Already have an account?{' '}
                  <Link
                    component={RouterLink}
                    to="/login"
                    variant="body1"
                    color={mode === 'dark' ? 'secondary.light' : 'secondary.main'}
                    sx={{
                      fontWeight: 'bold',
                      textDecoration: 'none',
                      position: 'relative',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        color: mode === 'dark' ? 'secondary.main' : 'secondary.dark',
                        transform: 'translateY(-1px)',
                      },
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        width: '0%',
                        height: '2px',
                        bottom: '-2px',
                        left: 0,
                        backgroundColor: mode === 'dark' ? theme.palette.secondary.light : theme.palette.secondary.main,
                        transition: 'width 0.3s ease',
                      },
                      '&:hover::after': {
                        width: '100%',
                      }
                    }}
                  >
                    Sign in
                  </Link>
                </Typography>
              </Box>
            </Zoom>
          )}
        </Paper>
        </Fade>
      </Container>

      <AuthFooter />

      {/* Enhanced Snackbar for user feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={snackbar.severity === 'error' ? 8000 : snackbar.severity === 'success' ? 4000 : 5000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ mt: 8 }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          variant="filled"
          icon={getSnackbarIcon(snackbar.severity)}
          sx={{
            width: '100%',
            borderRadius: 2,
            fontWeight: 500,
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
            '& .MuiAlert-icon': {
              fontSize: '1.5rem'
            }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Register;
