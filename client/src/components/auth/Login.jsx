import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Avatar,
  Alert,
  CircularProgress,
  Grow,
  Slide,
  Grid,
  Card,
  CardContent,
  Divider,
  InputAdornment,
  IconButton,
  Fade,
  Zoom
} from '@mui/material';
import {
  LockOutlined,
  School,
  Person,
  Visibility,
  VisibilityOff,
  Security,
  CheckCircle,
  ArrowBack
} from '@mui/icons-material';
import { AuthContext } from '../../context/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showError, setShowError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const { login, error, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Set animation complete after a delay
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowError(false);

    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setShowError(true);
      console.error('Login error:', err);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Container component="main" maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Button
          component={RouterLink}
          to="/"
          startIcon={<ArrowBack />}
          sx={{ mb: 2 }}
        >
          Back to Home
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Left side - Login Form */}
        <Grid item xs={12} md={6}>
          <Grow in={true} timeout={800}>
            <Paper
              elevation={6}
              sx={{
                p: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                borderRadius: 4,
                background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
                position: 'relative',
                overflow: 'hidden',
                height: '100%',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '5px',
                  background: 'linear-gradient(90deg, #4a148c 0%, #ff6d00 100%)',
                }
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  width: '100%',
                }}
              >
                <Avatar
                  sx={{
                    m: 1,
                    bgcolor: 'primary.main',
                    width: 70,
                    height: 70,
                    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
                    animation: animationComplete ? 'none' : 'pulse 1.5s infinite',
                    '@keyframes pulse': {
                      '0%': {
                        boxShadow: '0 0 0 0 rgba(74, 20, 140, 0.7)'
                      },
                      '70%': {
                        boxShadow: '0 0 0 15px rgba(74, 20, 140, 0)'
                      },
                      '100%': {
                        boxShadow: '0 0 0 0 rgba(74, 20, 140, 0)'
                      }
                    }
                  }}
                >
                  <School sx={{ fontSize: 45 }} />
                </Avatar>

                <Typography
                  component="h1"
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    mb: 1,
                    background: 'linear-gradient(90deg, #4a148c 0%, #ff6d00 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  National Score
                </Typography>

                <Typography variant="h6" sx={{ mb: 3, color: 'text.secondary', textAlign: 'center' }}>
                  Sign in to your account
                </Typography>

                {error && showError && (
                  <Slide direction="down" in={showError} mountOnEnter unmountOnExit>
                    <Alert
                      severity="error"
                      sx={{ width: '100%', mb: 2 }}
                      onClose={() => setShowError(false)}
                    >
                      {error}
                    </Alert>
                  </Slide>
                )}

                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="username"
                    label="Username"
                    name="username"
                    autoComplete="username"
                    autoFocus
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
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
                          <LockOutlined color="primary" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleTogglePasswordVisibility}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading}
                    sx={{
                      mt: 3,
                      mb: 2,
                      py: 1.5,
                      fontSize: '1rem',
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
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      'Sign In'
                    )}
                  </Button>

                  <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
                    Contact administrator if you don't have an account
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grow>
        </Grid>

        {/* Right side - Information */}
        <Grid item xs={12} md={6}>
          <Fade in={true} timeout={1200}>
            <Box>
              <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom>
                Welcome to National Score
              </Typography>

              <Typography variant="body1" paragraph>
                The comprehensive online examination platform designed for educational institutions.
              </Typography>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Key Benefits
              </Typography>

              {[
                { icon: <School />, text: "Access all your exams in one place" },
                { icon: <Timer />, text: "Take timed exams with automatic submission" },
                { icon: <Assessment />, text: "View detailed performance analytics" },
                { icon: <Security />, text: "Secure and reliable testing environment" }
              ].map((benefit, index) => (
                <Zoom in={true} style={{ transitionDelay: `${500 + (index * 150)}ms` }} key={index}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                      {benefit.icon}
                    </Avatar>
                    <Typography variant="body1">{benefit.text}</Typography>
                  </Box>
                </Zoom>
              ))}

              <Divider sx={{ my: 3 }} />

              <Card elevation={2} sx={{ mt: 3, borderRadius: 3, bgcolor: 'primary.lighter' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'success.main' }}>
                      <CheckCircle />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Need Help?
                      </Typography>
                      <Typography variant="body2">
                        If you're having trouble logging in or need assistance, please contact your administrator.
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Fade>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Login;
