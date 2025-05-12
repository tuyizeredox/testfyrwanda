import React, { useState } from 'react';
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
  Fade
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
  CheckCircle
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
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

  const { register } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  const handleNext = () => {
    if (activeStep === 0) {
      // Validate first step
      if (!email || !password || !confirmPassword) {
        setError('Please fill in all required fields');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }
    } else if (activeStep === 1) {
      // Validate second step
      if (!firstName || !lastName) {
        setError('Please fill in all required fields');
        return;
      }
    }

    setError('');
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      // Send all required fields to the register function
      await register({
        email,
        password,
        firstName,
        lastName,
        institution,
        phone
      });

      // Instead of showing the completion step, redirect directly to admin dashboard
      navigate('/admin');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to create an account. Please try again.');
      setActiveStep(0);
    } finally {
      setLoading(false);
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
        background: `linear-gradient(135deg, ${theme.palette.primary.darker} 0%, ${theme.palette.primary.main} 100%)`,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url(https://www.transparenttextures.com/patterns/cubes.png)',
          opacity: 0.1,
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
            elevation={24}
            sx={{
              p: { xs: 2, sm: 3, md: 5 },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              borderRadius: { xs: 4, md: 8 },
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 20px 80px rgba(0, 0, 0, 0.3)',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
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
          <Box
            sx={{
              position: 'absolute',
              top: -50,
              left: -50,
              width: 150,
              height: 150,
              borderRadius: '50%',
              background: `linear-gradient(45deg, ${theme.palette.primary.light}22, ${theme.palette.secondary.light}22)`,
              zIndex: 0,
            }}
          />

          <Box
            sx={{
              position: 'absolute',
              bottom: -80,
              right: -80,
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: `linear-gradient(45deg, ${theme.palette.secondary.light}22, ${theme.palette.primary.light}22)`,
              zIndex: 0,
            }}
          />

          {activeStep < 2 && (
            <Avatar
              sx={{
                m: 1,
                bgcolor: 'secondary.main',
                width: { xs: 60, sm: 70, md: 80 },
                height: { xs: 60, sm: 70, md: 80 },
                boxShadow: '0 8px 25px rgba(255, 109, 0, 0.4)',
                mb: 3,
                zIndex: 1,
                border: '4px solid rgba(255, 255, 255, 0.8)',
              }}
            >
              <HowToReg sx={{ fontSize: { xs: 30, sm: 35, md: 40 } }} />
            </Avatar>
          )}

          {activeStep < 2 && (
            <Typography
              component="h1"
              variant={{ xs: 'h4', sm: 'h3', md: 'h3' }}
              fontWeight="bold"
              sx={{
                mb: 1,
                background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.5px',
                fontSize: { xs: '1.75rem', sm: '2.25rem', md: '3rem' },
                textAlign: 'center'
              }}
            >
              Create Your Account
            </Typography>
          )}

          {activeStep < 2 && (
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                mb: 4,
                textAlign: 'center',
                maxWidth: 600,
                fontWeight: 500,
                px: { xs: 1, sm: 2, md: 3 },
                fontSize: { xs: '0.875rem', sm: '1rem', md: '1rem' }
              }}
            >
              Join Testify to access AI-powered exam grading and comprehensive education management tools
            </Typography>
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

          {activeStep === 0 && (
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
                  color="secondary.main"
                  sx={{
                    fontWeight: 'bold',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                >
                  Sign in
                </Link>
              </Typography>
            </Box>
          )}
        </Paper>
        </Fade>
      </Container>

      <AuthFooter />
    </Box>
  );
};

export default Register;
