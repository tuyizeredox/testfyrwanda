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
  InputAdornment,
  IconButton,
  Alert,
  Toolbar,
  useTheme,
  Fade
} from '@mui/material';
import {
  School,
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  LockOpen
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import AuthHeader from '../components/AuthHeader';
import AuthFooter from '../components/AuthFooter';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

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
              <LockOpen sx={{ fontSize: { xs: 30, sm: 35, md: 40 } }} />
            </Avatar>

            <Typography
              component="h1"
              variant="h3"
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
              Welcome Back
            </Typography>

            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                mb: 4,
                textAlign: 'center',
                maxWidth: 400,
                fontWeight: 500,
                px: { xs: 1, sm: 2, md: 3 },
                fontSize: { xs: '0.875rem', sm: '1rem', md: '1rem' }
              }}
            >
              Log in to your Testify account to access your exams and results
            </Typography>

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
                    '&.Mui-focused': {
                      boxShadow: '0 0 0 2px rgba(74, 20, 140, 0.2)',
                    }
                  }
                }}
              />

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
                    '&.Mui-focused': {
                      boxShadow: '0 0 0 2px rgba(74, 20, 140, 0.2)',
                    }
                  }
                }}
              />

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                <Link
                  component={RouterLink}
                  to="#"
                  variant="body2"
                  color="primary.main"
                  sx={{
                    fontWeight: 500,
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                >
                  Forgot password?
                </Link>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                disabled={loading}
                sx={{
                  py: { xs: 1.5, sm: 2 },
                  mb: 4,
                  fontWeight: 'bold',
                  fontSize: { xs: '1rem', sm: '1.1rem' },
                  borderRadius: '50px',
                  boxShadow: '0 10px 25px rgba(74, 20, 140, 0.3)',
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 15px 30px rgba(74, 20, 140, 0.4)',
                    transform: 'translateY(-2px)',
                    background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                  }
                }}
              >
                {loading ? 'Logging in...' : 'Log In'}
              </Button>

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
                    color="secondary.main"
                    sx={{
                      fontWeight: 'bold',
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline'
                      }
                    }}
                  >
                    Sign up now
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Fade>
      </Container>

      <AuthFooter />
    </Box>
  );
};

export default Login;
