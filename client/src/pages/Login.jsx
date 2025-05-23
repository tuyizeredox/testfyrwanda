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
  InputAdornment,
  IconButton,
  Alert,
  Toolbar,
  useTheme,
  Fade,
  Grow,
  Zoom,
  alpha,
  useMediaQuery,
  Divider,
  Card,
  CardContent
} from '@mui/material';
import {
  School,
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  LockOpen,
  CheckCircle,
  Login as LoginIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../context/ThemeContext';
import AuthHeader from '../components/AuthHeader';
import AuthFooter from '../components/AuthFooter';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);

  const { login } = useAuth();
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate inputs
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Call the login function from AuthContext with email and password
      const user = await login({
        email,
        password
      });

      // Check user role and redirect accordingly
      if (user && user.role === 'admin') {
        navigate('/admin'); // Redirect admins to admin dashboard
      } else {
        navigate('/dashboard'); // Redirect students to student dashboard
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to log in. Please check your credentials.');
    } finally {
      setLoading(false);
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
      <AuthHeader title="Log In" />
      <Toolbar /> {/* Spacer for fixed header */}

      <Container
        component="main"
        maxWidth="sm"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          py: { xs: 3, sm: 4, md: 8 },
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
                <LockOpen sx={{ fontSize: { xs: 30, sm: 35, md: 40 } }} />
              </Avatar>
            </Zoom>

            <Zoom in={true} style={{ transitionDelay: '400ms' }}>
              <Typography
                component="h1"
                variant="h3"
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
                Welcome Back
              </Typography>
            </Zoom>

            <Zoom in={true} style={{ transitionDelay: '500ms' }}>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{
                  mb: 4,
                  textAlign: 'center',
                  maxWidth: 400,
                  fontWeight: 500,
                  px: { xs: 1, sm: 2, md: 3 },
                  fontSize: { xs: '0.875rem', sm: '1rem', md: '1rem' },
                  opacity: 0.9
                }}
              >
                Log in to your Testify account to access your exams and results
              </Typography>
            </Zoom>

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
              <Zoom in={true} style={{ transitionDelay: '600ms' }}>
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
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      backgroundColor: mode === 'dark' ? alpha(theme.palette.background.default, 0.5) : alpha(theme.palette.common.white, 0.8),
                      '&:hover': {
                        backgroundColor: mode === 'dark' ? alpha(theme.palette.background.default, 0.7) : alpha(theme.palette.common.white, 0.9),
                      },
                      '&.Mui-focused': {
                        boxShadow: mode === 'dark'
                          ? `0 0 0 2px ${alpha(theme.palette.primary.main, 0.4)}`
                          : `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                        backgroundColor: mode === 'dark' ? alpha(theme.palette.background.default, 0.9) : alpha(theme.palette.common.white, 1),
                      }
                    },
                    '& .MuiInputLabel-root': {
                      color: mode === 'dark' ? alpha(theme.palette.text.primary, 0.7) : theme.palette.text.secondary,
                    },
                    '& .MuiInputBase-input': {
                      color: mode === 'dark' ? theme.palette.text.primary : theme.palette.text.primary,
                    }
                  }}
                />
              </Zoom>

              <Zoom in={true} style={{ transitionDelay: '700ms' }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="current-password"
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
                          sx={{
                            color: mode === 'dark' ? alpha(theme.palette.common.white, 0.7) : alpha(theme.palette.common.black, 0.6),
                          }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      backgroundColor: mode === 'dark' ? alpha(theme.palette.background.default, 0.5) : alpha(theme.palette.common.white, 0.8),
                      '&:hover': {
                        backgroundColor: mode === 'dark' ? alpha(theme.palette.background.default, 0.7) : alpha(theme.palette.common.white, 0.9),
                      },
                      '&.Mui-focused': {
                        boxShadow: mode === 'dark'
                          ? `0 0 0 2px ${alpha(theme.palette.primary.main, 0.4)}`
                          : `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                        backgroundColor: mode === 'dark' ? alpha(theme.palette.background.default, 0.9) : alpha(theme.palette.common.white, 1),
                      }
                    },
                    '& .MuiInputLabel-root': {
                      color: mode === 'dark' ? alpha(theme.palette.text.primary, 0.7) : theme.palette.text.secondary,
                    },
                    '& .MuiInputBase-input': {
                      color: mode === 'dark' ? theme.palette.text.primary : theme.palette.text.primary,
                    }
                  }}
                />
              </Zoom>

              <Zoom in={true} style={{ transitionDelay: '800ms' }}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                  <Link
                    component={RouterLink}
                    to="#"
                    variant="body2"
                    color={mode === 'dark' ? 'primary.light' : 'primary.main'}
                    sx={{
                      fontWeight: 500,
                      textDecoration: 'none',
                      transition: 'all 0.2s ease',
                      position: 'relative',
                      '&:hover': {
                        color: mode === 'dark' ? 'primary.main' : 'primary.dark',
                        transform: 'translateY(-1px)',
                      },
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        width: '0%',
                        height: '2px',
                        bottom: '-2px',
                        left: 0,
                        backgroundColor: mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.main,
                        transition: 'width 0.3s ease',
                      },
                      '&:hover::after': {
                        width: '100%',
                      }
                    }}
                  >
                    Forgot password?
                  </Link>
                </Box>
              </Zoom>

              <Zoom in={true} style={{ transitionDelay: '900ms' }}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={loading}
                  startIcon={<LoginIcon />}
                  sx={{
                    py: { xs: 1.5, sm: 2 },
                    mb: 4,
                    fontWeight: 'bold',
                    fontSize: { xs: '1rem', sm: '1.1rem' },
                    borderRadius: '50px',
                    boxShadow: mode === 'dark'
                      ? `0 10px 25px ${alpha(theme.palette.common.black, 0.4)}`
                      : '0 10px 25px rgba(74, 20, 140, 0.3)',
                    background: mode === 'dark'
                      ? `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`
                      : `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: mode === 'dark'
                        ? `0 15px 30px ${alpha(theme.palette.common.black, 0.5)}`
                        : '0 15px 30px rgba(74, 20, 140, 0.4)',
                      transform: 'translateY(-2px)',
                      background: mode === 'dark'
                        ? `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`
                        : `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                    },
                    '&:active': {
                      transform: 'translateY(1px)',
                      boxShadow: mode === 'dark'
                        ? `0 5px 15px ${alpha(theme.palette.common.black, 0.4)}`
                        : '0 5px 15px rgba(74, 20, 140, 0.3)',
                    },
                    '&.Mui-disabled': {
                      background: mode === 'dark'
                        ? alpha(theme.palette.primary.dark, 0.6)
                        : alpha(theme.palette.primary.main, 0.6),
                    }
                  }}
                >
                  {loading ? 'Logging in...' : 'Log In'}
                </Button>
              </Zoom>

              <Zoom in={true} style={{ transitionDelay: '1000ms' }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ fontWeight: 500 }}
                  >
                    Don't have an account?{' '}
                    <Link
                      component={RouterLink}
                      to="/register"
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
                      Sign up now
                    </Link>
                  </Typography>
                </Box>
              </Zoom>

              {/* Add a help card for dark mode */}
              {mode === 'dark' && animationComplete && (
                <Fade in={true} timeout={1000}>
                  <Card
                    elevation={4}
                    sx={{
                      mt: 4,
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.background.paper, 0.6),
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
                    }}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.2), width: 32, height: 32 }}>
                          <CheckCircle fontSize="small" sx={{ color: theme.palette.success.main }} />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold" color="text.primary">
                            Need Help?
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Contact your administrator if you're having trouble logging in.
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Fade>
              )}
            </Box>
          </Paper>
        </Fade>
      </Container>

      <AuthFooter />
    </Box>
  );
};

export default Login;
