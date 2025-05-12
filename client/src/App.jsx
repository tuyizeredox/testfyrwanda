import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useAuth } from './context/AuthContext';
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Paper,
  Divider,
  Avatar,
  Chip,
  Grow,
  Zoom,
  Fade,
  Slide,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  useScrollTrigger,
  Rating,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  Badge,
  LinearProgress,
  Stack
} from '@mui/material';
import {
  School,
  Timer,
  Assessment,
  Security,
  Psychology,
  EmojiEvents,
  ArrowForward,
  Menu as MenuIcon,
  Close,
  CheckCircle,
  ExpandMore,
  Star,
  StarBorder,
  FormatQuote,
  Email,
  Send,
  Phone,
  LocationOn,
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  Check,
  Notifications,
  Dashboard,
  Person,
  Login,
  MenuBook,
  Laptop,
  Subject,
  Link,
  QuestionAnswer,
  Devices
} from '@mui/icons-material';

// Create theme with gamified design
const theme = createTheme({
  palette: {
    primary: {
      main: '#4a148c', // Deep purple
      light: '#7c43bd',
      dark: '#12005e',
      contrastText: '#ffffff',
      lighter: 'rgba(74, 20, 140, 0.1)', // Very light purple for backgrounds
    },
    secondary: {
      main: '#ff6d00', // Bright orange
      light: '#ff9e40',
      dark: '#c43e00',
      contrastText: '#000000',
      lighter: 'rgba(255, 109, 0, 0.1)', // Very light orange for backgrounds
    },
    success: {
      main: '#00c853', // Bright green
      light: '#5efc82',
      dark: '#009624',
      contrastText: '#ffffff',
    },
    error: {
      main: '#d50000', // Bright red
      light: '#ff5131',
      dark: '#9b0000',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#ffc107', // Amber
      light: '#fff350',
      dark: '#c79100',
      contrastText: '#000000',
    },
    info: {
      main: '#2196f3', // Blue
      light: '#6ec6ff',
      dark: '#0069c0',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
    divider: 'rgba(0, 0, 0, 0.08)',
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 30,
          padding: '10px 24px',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 15px rgba(0, 0, 0, 0.2)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

// Hide app bar on scroll
function HideOnScroll(props) {
  const { children } = props;
  const trigger = useScrollTrigger();

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

function App() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuAnchorEl, setMobileMenuAnchorEl] = useState(null);
  const [activeSection, setActiveSection] = useState('home');
  const [animationComplete, setAnimationComplete] = useState(false);

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/');
    handleMobileMenuClose();
  };

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);

      // Determine active section based on scroll position
      const sections = ['home', 'features', 'how-it-works', 'testimonials', 'pricing', 'faq', 'contact'];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);

    // Set animation complete after a delay
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 2000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, []);

  const handleMobileMenuOpen = (event) => {
    setMobileMenuAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchorEl(null);
  };

  const scrollToSection = (sectionId) => {
    handleMobileMenuClose();
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMenuAnchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={Boolean(mobileMenuAnchorEl)}
      onClose={handleMobileMenuClose}
      PaperProps={{
        elevation: 3,
        sx: {
          borderRadius: 2,
          minWidth: 200,
          mt: 1,
        },
      }}
    >
      <MenuItem onClick={() => scrollToSection('home')} selected={activeSection === 'home'}>
        Home
      </MenuItem>
      <MenuItem onClick={() => scrollToSection('features')} selected={activeSection === 'features'}>
        Features
      </MenuItem>
      <MenuItem onClick={() => scrollToSection('how-it-works')} selected={activeSection === 'how-it-works'}>
        How It Works
      </MenuItem>
      <MenuItem onClick={() => scrollToSection('testimonials')} selected={activeSection === 'testimonials'}>
        Testimonials
      </MenuItem>
      <MenuItem onClick={() => scrollToSection('faq')} selected={activeSection === 'faq'}>
        FAQ
      </MenuItem>
      <MenuItem onClick={() => scrollToSection('contact')} selected={activeSection === 'contact'}>
        Contact
      </MenuItem>
      <Divider />

      {isAuthenticated ? (
        <>
          <MenuItem
            component={RouterLink}
            to={user?.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'}
          >
            <Dashboard sx={{ mr: 2, fontSize: 20, color: 'primary.main' }} />
            Dashboard
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <Login sx={{ mr: 2, fontSize: 20, color: 'error.main', transform: 'rotate(180deg)' }} />
            Logout
          </MenuItem>
        </>
      ) : (
        <>
          <MenuItem component={RouterLink} to="/register">
            <Person sx={{ mr: 2, fontSize: 20, color: 'primary.main' }} />
            Register
          </MenuItem>
          <MenuItem component={RouterLink} to="/login">
            <Login sx={{ mr: 2, fontSize: 20, color: 'primary.main' }} />
            Login
          </MenuItem>
        </>
      )}
    </Menu>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {/* Header */}
      <HideOnScroll>
        <AppBar
          position="fixed"
          color="primary"
          sx={{
            boxShadow: isScrolled ? 6 : 0,
            transition: 'all 0.3s ease',
            background: isScrolled
              ? 'linear-gradient(90deg, #4a148c, #7c43bd)'
              : 'linear-gradient(90deg, rgba(74, 20, 140, 0.95), rgba(124, 67, 189, 0.95))',
            backdropFilter: 'blur(8px)',
          }}
        >
          <Container maxWidth="lg">
            <Toolbar sx={{ py: { xs: 2, md: isScrolled ? 1.5 : 3 } }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  textDecoration: 'none',
                  color: 'inherit',
                  cursor: 'pointer',
                }}
                onClick={() => scrollToSection('home')}
              >
                <Avatar
                  sx={{
                    width: { xs: 45, md: isScrolled ? 50 : 60 },
                    height: { xs: 45, md: isScrolled ? 50 : 60 },
                    mr: 2,
                    transition: 'all 0.3s ease',
                    bgcolor: 'secondary.main',
                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                  }}
                >
                  <School sx={{ fontSize: { xs: 24, md: isScrolled ? 28 : 32 } }} />
                </Avatar>
                <Typography
                  variant="h5"
                  sx={{
                    flexGrow: 1,
                    fontWeight: 'bold',
                    fontSize: { xs: '1.4rem', md: isScrolled ? '1.8rem' : '2.2rem' },
                    letterSpacing: '0.5px',
                    transition: 'all 0.3s ease',
                    background: 'linear-gradient(90deg, #ffffff, #f0f0f0)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  }}
                >
                  Testify
                </Typography>
              </Box>

              <Box sx={{ flexGrow: 1 }} />

              {/* Desktop Navigation */}
              <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
                {[
                  { id: 'home', label: 'Home' },
                  { id: 'features', label: 'Features' },
                  { id: 'how-it-works', label: 'How It Works' },
                  { id: 'testimonials', label: 'Testimonials' },
                  { id: 'faq', label: 'FAQ' },
                  { id: 'contact', label: 'Contact' }
                ].map((item) => (
                  <Button
                    key={item.id}
                    color="inherit"
                    onClick={() => scrollToSection(item.id)}
                    sx={{
                      mx: 0.5,
                      px: 2,
                      py: isScrolled ? 1 : 1.5,
                      borderRadius: 2,
                      fontSize: isScrolled ? '0.9rem' : '1rem',
                      transition: 'all 0.3s ease',
                      ...(activeSection === item.id && {
                        bgcolor: 'rgba(255, 255, 255, 0.15)',
                        fontWeight: 'bold',
                      }),
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                        transform: 'translateY(-3px)',
                      }
                    }}
                  >
                    {item.label}
                  </Button>
                ))}

                {isAuthenticated ? (
                  <>
                    <Button
                      variant="outlined"
                      color="inherit"
                      component={RouterLink}
                      to={user?.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'}
                      startIcon={<Dashboard />}
                      sx={{
                        ml: 3,
                        px: 3,
                        py: isScrolled ? 1 : 1.5,
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                        borderWidth: '2px',
                        fontSize: isScrolled ? '0.9rem' : '1rem',
                        borderRadius: '50px',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: 'white',
                          bgcolor: 'rgba(255, 255, 255, 0.1)',
                          transform: 'translateY(-3px)',
                          boxShadow: '0 6px 15px rgba(0, 0, 0, 0.2)',
                        }
                      }}
                    >
                      Dashboard
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={handleLogout}
                      startIcon={<Login sx={{ transform: 'rotate(180deg)' }} />}
                      sx={{
                        ml: 2,
                        px: 3,
                        py: isScrolled ? 1 : 1.5,
                        color: 'black',
                        fontWeight: 'bold',
                        fontSize: isScrolled ? '0.9rem' : '1rem',
                        borderRadius: '50px',
                        boxShadow: '0 6px 15px rgba(0, 0, 0, 0.2)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-3px)',
                          boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)',
                        }
                      }}
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outlined"
                      color="inherit"
                      component={RouterLink}
                      to="/register"
                      sx={{
                        ml: 3,
                        px: 3,
                        py: isScrolled ? 1 : 1.5,
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                        borderWidth: '2px',
                        fontSize: isScrolled ? '0.9rem' : '1rem',
                        borderRadius: '50px',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: 'white',
                          bgcolor: 'rgba(255, 255, 255, 0.1)',
                          transform: 'translateY(-3px)',
                          boxShadow: '0 6px 15px rgba(0, 0, 0, 0.2)',
                        }
                      }}
                    >
                      Register
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      component={RouterLink}
                      to="/login"
                      sx={{
                        ml: 2,
                        px: 3,
                        py: isScrolled ? 1 : 1.5,
                        color: 'black',
                        fontWeight: 'bold',
                        fontSize: isScrolled ? '0.9rem' : '1rem',
                        borderRadius: '50px',
                        boxShadow: '0 6px 15px rgba(0, 0, 0, 0.2)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-3px)',
                          boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)',
                        }
                      }}
                    >
                      Login
                    </Button>
                  </>
                )}
              </Box>

              {/* Mobile Navigation */}
              <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
                <IconButton
                  edge="end"
                  aria-label="show more"
                  aria-haspopup="true"
                  onClick={handleMobileMenuOpen}
                  color="inherit"
                  sx={{
                    p: 1.5,
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                    }
                  }}
                >
                  <MenuIcon sx={{ fontSize: 28 }} />
                </IconButton>
              </Box>
            </Toolbar>
          </Container>
        </AppBar>
      </HideOnScroll>

      {/* Toolbar placeholder to prevent content from hiding behind the AppBar */}
      <Toolbar sx={{ mb: 2, py: { xs: 2, md: 3 } }} />
      {renderMobileMenu}

      {/* Hero Section */}
      <Box
        id="home"
        sx={{
          background: 'url(https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80) center center/cover no-repeat',
          color: 'white',
          pt: { xs: 10, md: 16 },
          pb: { xs: 10, md: 16 },
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, rgba(74, 20, 140, 0.9) 0%, rgba(124, 67, 189, 0.85) 100%)',
            zIndex: 1,
          }
        }}
      >
        {/* Animated background elements */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: `
              radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 10%),
              radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 15%),
              radial-gradient(circle at 40% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 15%),
              radial-gradient(circle at 70% 90%, rgba(255, 255, 255, 0.1) 0%, transparent 10%)
            `,
            zIndex: 2,
          }}
        />

        {/* Animated particles */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 2,
            overflow: 'hidden',
          }}
        >
          {[...Array(20)].map((_, index) => (
            <Box
              key={index}
              sx={{
                position: 'absolute',
                width: Math.random() * 10 + 5,
                height: Math.random() * 10 + 5,
                background: 'rgba(255, 255, 255, 0.3)',
                borderRadius: '50%',
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: `float ${Math.random() * 10 + 10}s infinite ease-in-out ${Math.random() * 5}s,
                           pulse ${Math.random() * 5 + 5}s infinite alternate ${Math.random() * 5}s`,
              }}
            />
          ))}
        </Box>

        {/* Animated wave effect */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '200%',
            height: '12%',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '100% 100% 0 0',
            animation: 'wave 15s infinite linear',
            '@keyframes wave': {
              '0%': { transform: 'translateX(0)' },
              '50%': { transform: 'translateX(-25%)' },
              '100%': { transform: 'translateX(-50%)' }
            },
            zIndex: 2,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: '-50%',
            width: '200%',
            height: '8%',
            background: 'rgba(255, 255, 255, 0.15)',
            borderRadius: '100% 100% 0 0',
            animation: 'wave 20s infinite linear reverse',
            zIndex: 2,
          }}
        />

        {/* Decorative shapes */}
        <Box
          sx={{
            position: 'absolute',
            top: '15%',
            left: '5%',
            width: '20px',
            height: '20px',
            background: 'rgba(255, 109, 0, 0.7)',
            borderRadius: '50%',
            boxShadow: '0 0 20px rgba(255, 109, 0, 0.7)',
            animation: 'moveAround 25s infinite linear',
            '@keyframes moveAround': {
              '0%': { transform: 'rotate(0deg) translateX(50px) rotate(0deg)' },
              '100%': { transform: 'rotate(360deg) translateX(50px) rotate(-360deg)' }
            },
            zIndex: 2,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '20%',
            right: '10%',
            width: '15px',
            height: '15px',
            background: 'rgba(255, 255, 255, 0.7)',
            borderRadius: '50%',
            boxShadow: '0 0 20px rgba(255, 255, 255, 0.7)',
            animation: 'moveAround 20s infinite linear reverse',
            zIndex: 2,
          }}
        />

        {/* Geometric shapes */}
        <Box
          sx={{
            position: 'absolute',
            top: '30%',
            right: '15%',
            width: '40px',
            height: '40px',
            border: '3px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '8px',
            transform: 'rotate(45deg)',
            animation: 'float 8s infinite ease-in-out',
            zIndex: 2,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '40%',
            left: '10%',
            width: '30px',
            height: '30px',
            border: '3px solid rgba(255, 109, 0, 0.3)',
            borderRadius: '50%',
            animation: 'pulse 6s infinite alternate',
            zIndex: 2,
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 3 }}>
          <Grid container spacing={8} alignItems="center">
            <Grid item xs={12} md={6}>
              <Grow in={true} timeout={1000}>
                <Box>
                  <Chip
                    label="RWANDA'S #1 EXAM PLATFORM"
                    color="secondary"
                    sx={{
                      mb: 3,
                      fontWeight: 'bold',
                      px: 2,
                      py: 1,
                      borderRadius: '50px',
                      background: 'rgba(255, 109, 0, 0.9)',
                      color: 'white',
                      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
                      border: '2px solid rgba(255, 255, 255, 0.2)',
                    }}
                  />

                  <Typography
                    variant="h1"
                    component="h1"
                    sx={{
                      fontWeight: 800,
                      fontSize: { xs: '2.8rem', sm: '3.2rem', md: '4rem', lg: '5rem' },
                      mb: 2,
                      textShadow: '0 4px 15px rgba(0,0,0,0.4)',
                      background: 'linear-gradient(90deg, #ffffff, #ffcc80)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      letterSpacing: '-0.02em',
                      lineHeight: 1.1,
                      position: 'relative',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: -10,
                        left: 0,
                        width: '80px',
                        height: '6px',
                        background: 'linear-gradient(90deg, #ff6d00, #ffcc80)',
                        borderRadius: '3px',
                      }
                    }}
                  >
                    Transform Education in Rwanda
                  </Typography>

                  <Typography
                    variant="h5"
                    sx={{
                      mb: 5,
                      fontWeight: 400,
                      fontSize: { xs: '1.2rem', sm: '1.3rem', md: '1.6rem' },
                      maxWidth: '95%',
                      lineHeight: 1.5,
                      textShadow: '0 2px 10px rgba(0,0,0,0.2)',
                      position: 'relative',
                      pl: 2,
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '3px',
                        height: '100%',
                        background: 'linear-gradient(to bottom, #ff6d00, transparent)',
                        borderRadius: '3px',
                      }
                    }}
                  >
                    Testify brings AI-powered grading and seamless exam management to Rwanda's schools and universities
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 6 }}>
                    {isAuthenticated ? (
                      <>
                        <Button
                          variant="contained"
                          color="secondary"
                          size="large"
                          component={RouterLink}
                          to={user?.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'}
                          startIcon={<Dashboard />}
                          sx={{
                            color: 'black',
                            fontWeight: 'bold',
                            px: 5,
                            py: 2,
                            fontSize: '1.2rem',
                            borderRadius: '50px',
                            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3), 0 0 0 5px rgba(255, 109, 0, 0.3)',
                            background: 'linear-gradient(45deg, #ff6d00, #ffab40)',
                            border: '2px solid rgba(255, 255, 255, 0.3)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              boxShadow: '0 15px 30px rgba(0, 0, 0, 0.4), 0 0 0 5px rgba(255, 109, 0, 0.5)',
                              transform: 'translateY(-5px) scale(1.03)',
                            }
                          }}
                        >
                          Go to Dashboard
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="contained"
                          color="secondary"
                          size="large"
                          component={RouterLink}
                          to="/register"
                          sx={{
                            color: 'black',
                            fontWeight: 'bold',
                            px: 5,
                            py: 2,
                            fontSize: '1.2rem',
                            borderRadius: '50px',
                            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3), 0 0 0 5px rgba(255, 109, 0, 0.3)',
                            background: 'linear-gradient(45deg, #ff6d00, #ffab40)',
                            border: '2px solid rgba(255, 255, 255, 0.3)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              boxShadow: '0 15px 30px rgba(0, 0, 0, 0.4), 0 0 0 5px rgba(255, 109, 0, 0.5)',
                              transform: 'translateY(-5px) scale(1.03)',
                            }
                          }}
                        >
                          Get Started Now
                        </Button>
                      </>
                    )}
                    <Button
                      variant="outlined"
                      color="inherit"
                      size="large"
                      onClick={() => scrollToSection('features')}
                      sx={{
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                        borderWidth: '2px',
                        px: 4,
                        py: 2,
                        fontSize: '1.2rem',
                        borderRadius: '50px',
                        backdropFilter: 'blur(5px)',
                        background: 'rgba(255, 255, 255, 0.1)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: 'white',
                          background: 'rgba(255, 255, 255, 0.2)',
                          transform: 'translateY(-5px)',
                          boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)',
                        }
                      }}
                    >
                      Explore Features
                    </Button>
                  </Box>

                  {/* Stats */}
                  <Box
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: { xs: 2, md: 4 },
                      mt: 2,
                      p: 3,
                      borderRadius: 4,
                      background: 'rgba(0, 0, 0, 0.2)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    {[
                      { number: '500+', label: 'Schools', icon: <School /> },
                      { number: '50,000+', label: 'Students', icon: <Person /> },
                      { number: '99.8%', label: 'Accuracy', icon: <CheckCircle /> }
                    ].map((stat, index) => (
                      <Fade in={true} style={{ transitionDelay: `${800 + (index * 200)}ms` }} key={index}>
                        <Box sx={{
                          textAlign: 'center',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          flex: 1,
                          minWidth: { xs: '100px', sm: '120px' },
                        }}>
                          <Avatar
                            sx={{
                              bgcolor: 'rgba(255, 109, 0, 0.2)',
                              color: 'secondary.main',
                              mb: 1,
                              width: 45,
                              height: 45,
                              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
                            }}
                          >
                            {stat.icon}
                          </Avatar>
                          <Typography
                            variant="h4"
                            component="p"
                            fontWeight="bold"
                            sx={{
                              color: 'white',
                              textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                              fontSize: { xs: '1.8rem', md: '2.2rem' },
                            }}
                          >
                            {stat.number}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: 'rgba(255, 255, 255, 0.8)',
                              fontWeight: 'medium',
                            }}
                          >
                            {stat.label}
                          </Typography>
                        </Box>
                      </Fade>
                    ))}
                  </Box>
                </Box>
              </Grow>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ position: 'relative' }}>
                {/* Decorative elements */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: -30,
                    left: -30,
                    right: -30,
                    bottom: -30,
                    borderRadius: '30px',
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
                    transform: 'rotate(-5deg)',
                    zIndex: 0,
                    border: '2px dashed rgba(255, 255, 255, 0.2)',
                  }}
                />

                <Box
                  sx={{
                    position: 'absolute',
                    top: -15,
                    left: -15,
                    right: -15,
                    bottom: -15,
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, rgba(255, 109, 0, 0.1) 0%, rgba(255, 109, 0, 0) 100%)',
                    transform: 'rotate(3deg)',
                    zIndex: 0,
                  }}
                />

                <Zoom in={true} style={{ transitionDelay: '500ms' }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      position: 'relative',
                      zIndex: 1,
                    }}
                  >
                    <Box
                      component="img"
                      src="https://img.freepik.com/free-vector/students-watching-webinar-computer-studying-online_74855-15522.jpg"
                      alt="Rwanda Online Exam Illustration"
                      sx={{
                        width: '100%',
                        maxWidth: 600,
                        height: 'auto',
                        borderRadius: 8,
                        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
                        transform: 'perspective(1200px) rotateY(-8deg) rotateX(5deg)',
                        transition: 'all 0.5s ease',
                        border: '8px solid rgba(255,255,255,0.2)',
                        '&:hover': {
                          transform: 'perspective(1200px) rotateY(0deg) rotateX(0deg) scale(1.05)',
                          boxShadow: '0 30px 60px rgba(0, 0, 0, 0.6)',
                        }
                      }}
                    />

                    {/* Floating badges */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '10%',
                        left: '-5%',
                        bgcolor: 'white',
                        color: 'primary.main',
                        borderRadius: '15px',
                        py: 1.5,
                        px: 3,
                        boxShadow: '0 15px 30px rgba(0,0,0,0.3)',
                        animation: 'float 3s infinite ease-in-out',
                        zIndex: 2,
                        border: '2px solid rgba(74, 20, 140, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <Psychology color="primary" />
                      <Typography variant="subtitle1" fontWeight="bold">
                        AI-Powered Grading
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: '15%',
                        right: '-3%',
                        bgcolor: 'secondary.main',
                        color: 'black',
                        borderRadius: '15px',
                        py: 1.5,
                        px: 3,
                        boxShadow: '0 15px 30px rgba(0,0,0,0.3)',
                        animation: 'float 4s infinite ease-in-out 1s',
                        zIndex: 2,
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <Timer />
                      <Typography variant="subtitle1" fontWeight="bold">
                        Instant Results
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        position: 'absolute',
                        top: '40%',
                        right: '-8%',
                        bgcolor: 'rgba(255, 255, 255, 0.95)',
                        color: '#00c853',
                        borderRadius: '15px',
                        py: 1.5,
                        px: 3,
                        boxShadow: '0 15px 30px rgba(0,0,0,0.3)',
                        animation: 'float 5s infinite ease-in-out 2s',
                        zIndex: 2,
                        border: '2px solid rgba(0, 200, 83, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        transform: 'rotate(5deg)',
                      }}
                    >
                      <Assessment sx={{ color: '#00c853' }} />
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#00c853' }}>
                        Detailed Analytics
                      </Typography>
                    </Box>
                  </Box>
                </Zoom>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Developers Section */}
      <Box sx={{ py: 6, bgcolor: 'background.default', position: 'relative', overflow: 'hidden' }}>
        {/* Background decorative elements */}
        <Box
          sx={{
            position: 'absolute',
            top: '20%',
            left: '5%',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(74, 20, 140, 0.03) 0%, transparent 70%)',
            zIndex: 0,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '20%',
            right: '5%',
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255, 109, 0, 0.03) 0%, transparent 70%)',
            zIndex: 0,
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Chip
              label="DEVELOPERS"
              color="primary"
              sx={{
                mb: 2,
                fontWeight: 'bold',
                px: 2,
                py: 0.8,
                borderRadius: '50px',
                background: 'linear-gradient(90deg, #4a148c, #7c43bd)',
                color: 'white',
                boxShadow: '0 4px 10px rgba(74, 20, 140, 0.3)',
              }}
            />
            <Typography
              variant="h3"
              component="h2"
              fontWeight="bold"
              gutterBottom
              sx={{
                fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' },
                background: 'linear-gradient(90deg, #4a148c, #7c43bd)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2,
              }}
            >
              Meet Our Team
            </Typography>
          </Box>

          <Grid container spacing={4} justifyContent="center">
            {[
              {
                name: 'Tuyizere Dieudonne',
                role: 'Lead Developer',
                color: '#4a148c',
                delay: 100,
                image: '/doxp.jpg',
                quote: "Building innovative solutions that transform education."
              },
              {
                name: 'Bukozi Aristote',
                role: 'Developer',
                color: '#ff6d00',
                delay: 200,
                image: '/IMG-20240912-WA0006.jpg',
                quote: "Passionate about creating technology that empowers learning."
              }
            ].map((developer, index) => (
              <Grid item xs={12} sm={6} md={5} key={index}>
                <Zoom in={true} style={{ transitionDelay: `${developer.delay}ms` }}>
                  <Card
                    elevation={4}
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 4,
                      overflow: 'hidden',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-10px)',
                        boxShadow: '0 12px 30px rgba(0, 0, 0, 0.15)',
                      }
                    }}
                  >
                    <Box
                      sx={{
                        height: 8,
                        width: '100%',
                        bgcolor: developer.color,
                      }}
                    />
                    <CardContent sx={{ p: 3, flexGrow: 1, textAlign: 'center' }}>
                      <Avatar
                        src={developer.image}
                        sx={{
                          bgcolor: `${developer.color}15`,
                          color: developer.color,
                          width: 120,
                          height: 120,
                          mx: 'auto',
                          mb: 2,
                          boxShadow: `0 4px 10px ${developer.color}30`,
                          border: `3px solid ${developer.color}`,
                          fontSize: '2rem',
                          objectFit: 'cover',
                          '&:hover': {
                            transform: 'scale(1.05)',
                            transition: 'transform 0.3s ease',
                            boxShadow: `0 8px 20px ${developer.color}50`,
                          }
                        }}
                      >
                        {!developer.image && developer.name.charAt(0)}
                      </Avatar>
                      <Typography
                        variant="h5"
                        component="h3"
                        fontWeight="bold"
                        sx={{
                          color: developer.color,
                          mb: 1
                        }}
                      >
                        {developer.name}
                      </Typography>
                      <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{
                          fontWeight: 'medium',
                          mb: 1,
                        }}
                      >
                        {developer.role}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          fontStyle: 'italic',
                          mt: 1,
                        }}
                      >
                        {developer.quote}
                      </Typography>
                    </CardContent>
                  </Card>
                </Zoom>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box id="features" sx={{ py: 12, bgcolor: 'background.default', position: 'relative', overflow: 'hidden' }}>
        {/* Background decorative elements */}
        <Box
          sx={{
            position: 'absolute',
            top: '10%',
            left: '5%',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(74, 20, 140, 0.03) 0%, transparent 70%)',
            zIndex: 0,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '10%',
            right: '5%',
            width: '250px',
            height: '250px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255, 109, 0, 0.03) 0%, transparent 70%)',
            zIndex: 0,
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Chip
              label="POWERFUL FEATURES"
              color="primary"
              sx={{
                mb: 2,
                fontWeight: 'bold',
                px: 2,
                py: 0.8,
                borderRadius: '50px',
                background: 'linear-gradient(90deg, #4a148c, #7c43bd)',
                color: 'white',
                boxShadow: '0 4px 10px rgba(74, 20, 140, 0.3)',
              }}
            />
            <Typography
              variant="h2"
              component="h2"
              fontWeight="bold"
              gutterBottom
              sx={{
                fontSize: { xs: '2.2rem', sm: '2.5rem', md: '3rem' },
                background: 'linear-gradient(90deg, #4a148c, #7c43bd)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2,
              }}
            >
              Everything You Need for Online Exams
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{
                maxWidth: 700,
                mx: 'auto',
                fontSize: { xs: '1rem', md: '1.1rem' },
                lineHeight: 1.6,
              }}
            >
              Testify provides a complete suite of tools designed specifically for Rwanda's educational institutions
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {[
              {
                icon: <School fontSize="large" />,
                title: 'Student Management',
                description: 'Easily register and manage students with a user-friendly interface. Import student data in bulk or add them individually.',
                color: '#4a148c',
                delay: 100
              },
              {
                icon: <Timer fontSize="large" />,
                title: 'Timed Exams',
                description: 'Set time limits for exams with automatic submission when time expires. Students receive timely notifications as deadlines approach.',
                color: '#ff6d00',
                delay: 200
              },
              {
                icon: <Assessment fontSize="large" />,
                title: 'Detailed Analytics',
                description: 'Get comprehensive insights into student performance and exam statistics with visual dashboards and exportable reports.',
                color: '#00c853',
                delay: 300
              },
              {
                icon: <Security fontSize="large" />,
                title: 'Secure Platform',
                description: 'Ensure exam integrity with our secure testing environment featuring browser lockdown and anti-cheating measures.',
                color: '#2196f3',
                delay: 400
              },
              {
                icon: <Psychology fontSize="large" />,
                title: 'AI-Powered Grading',
                description: 'Utilize advanced AI to grade open-ended questions automatically with remarkable accuracy, saving teachers countless hours.',
                color: '#9c27b0',
                delay: 500
              },
              {
                icon: <EmojiEvents fontSize="large" />,
                title: 'Performance Tracking',
                description: 'Track student progress and improvement over time with visual reports. Identify strengths and areas needing improvement.',
                color: '#f44336',
                delay: 600
              },
            ].map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Zoom in={true} style={{ transitionDelay: `${feature.delay}ms` }}>
                  <Card
                    elevation={4}
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 4,
                      overflow: 'hidden',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-10px)',
                        boxShadow: '0 12px 30px rgba(0, 0, 0, 0.15)',
                        '& .feature-icon': {
                          transform: 'scale(1.1) rotate(5deg)',
                        }
                      }
                    }}
                  >
                    <Box
                      sx={{
                        height: 8,
                        width: '100%',
                        bgcolor: feature.color,
                      }}
                    />
                    <CardContent sx={{ p: 3, flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar
                          className="feature-icon"
                          sx={{
                            bgcolor: `${feature.color}15`,
                            color: feature.color,
                            width: 60,
                            height: 60,
                            mr: 2,
                            boxShadow: `0 4px 10px ${feature.color}30`,
                            transition: 'transform 0.3s ease',
                          }}
                        >
                          {feature.icon}
                        </Avatar>
                        <Typography
                          variant="h5"
                          component="h3"
                          fontWeight="bold"
                          sx={{
                            color: feature.color,
                          }}
                        >
                          {feature.title}
                        </Typography>
                      </Box>
                      <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{
                          lineHeight: 1.6,
                        }}
                      >
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Zoom>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ textAlign: 'center', mt: 8 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => scrollToSection('how-it-works')}
              endIcon={<ArrowForward />}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 50,
                fontWeight: 'bold',
                boxShadow: '0 8px 20px rgba(74, 20, 140, 0.3)',
              }}
            >
              See How It Works
            </Button>
          </Box>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Box id="how-it-works" sx={{ py: 12, background: 'linear-gradient(135deg, #f8f9fa 0%, #f0f2f5 100%)', position: 'relative', overflow: 'hidden' }}>
        {/* Decorative elements */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(74, 20, 140, 0.03) 0%, transparent 20%), radial-gradient(circle at 90% 80%, rgba(255, 109, 0, 0.03) 0%, transparent 20%)',
            zIndex: 0,
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Chip
              label="SIMPLE PROCESS"
              color="secondary"
              sx={{
                mb: 2,
                fontWeight: 'bold',
                px: 2,
                py: 0.8,
                borderRadius: '50px',
                background: 'linear-gradient(90deg, #ff6d00, #ff9e40)',
                color: 'black',
                boxShadow: '0 4px 10px rgba(255, 109, 0, 0.3)',
              }}
            />
            <Typography
              variant="h2"
              component="h2"
              fontWeight="bold"
              gutterBottom
              sx={{
                fontSize: { xs: '2.2rem', sm: '2.5rem', md: '3rem' },
                background: 'linear-gradient(90deg, #4a148c, #7c43bd)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2,
              }}
            >
              How Testify Works
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{
                maxWidth: 700,
                mx: 'auto',
                fontSize: { xs: '1rem', md: '1.1rem' },
                lineHeight: 1.6,
              }}
            >
              Our platform simplifies the entire examination process for Rwanda's schools and universities
            </Typography>
          </Box>

          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} lg={6}>
              <Box sx={{ position: 'relative' }}>
                <Box
                  sx={{
                    position: 'absolute',
                    top: -15,
                    left: -15,
                    right: -15,
                    bottom: -15,
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, rgba(74, 20, 140, 0.1) 0%, rgba(255, 109, 0, 0.1) 100%)',
                    transform: 'rotate(-2deg)',
                    zIndex: 0,
                  }}
                />
                <Fade in={true} timeout={1000}>
                  <Box
                    sx={{
                      position: 'relative',
                      zIndex: 1,
                      borderRadius: 4,
                      overflow: 'hidden',
                      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
                      border: '5px solid white',
                    }}
                  >
                    <Box
                      component="img"
                      src="https://img.freepik.com/free-vector/online-learning-concept-illustration_114360-4765.jpg"
                      alt="How It Works Illustration"
                      sx={{
                        width: '100%',
                        height: 'auto',
                        display: 'block',
                        transition: 'transform 0.5s ease',
                        '&:hover': {
                          transform: 'scale(1.05)',
                        }
                      }}
                    />
                  </Box>
                </Fade>

                {/* Floating badges */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: '10%',
                    right: '5%',
                    bgcolor: 'white',
                    color: 'primary.main',
                    borderRadius: '12px',
                    py: 1,
                    px: 2,
                    boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                    animation: 'float 3s infinite ease-in-out',
                    zIndex: 2,
                    display: { xs: 'none', md: 'block' },
                  }}
                >
                  <Typography variant="subtitle2" fontWeight="bold">
                    Easy to Use
                  </Typography>
                </Box>

                <Box
                  sx={{
                    position: 'absolute',
                    bottom: '15%',
                    left: '5%',
                    bgcolor: 'secondary.main',
                    color: 'black',
                    borderRadius: '12px',
                    py: 1,
                    px: 2,
                    boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                    animation: 'float 4s infinite ease-in-out 1s',
                    zIndex: 2,
                    display: { xs: 'none', md: 'block' },
                  }}
                >
                  <Typography variant="subtitle2" fontWeight="bold">
                    Time-Saving
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} lg={6}>
              <Box sx={{ position: 'relative' }}>
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: 0,
                    width: '100%',
                    height: '80%',
                    transform: 'translateY(-50%)',
                    borderLeft: '2px dashed rgba(74, 20, 140, 0.3)',
                    zIndex: 0,
                  }}
                />

                {[
                  {
                    number: '01',
                    title: 'Create Exams',
                    description: 'Administrators can easily create exams by uploading documents or creating questions directly in the platform. Support for multiple question types including multiple-choice, essay, and file upload.',
                    color: '#4a148c',
                    icon: <School fontSize="large" />,
                  },
                  {
                    number: '02',
                    title: 'Assign to Students',
                    description: 'Assign exams to individual students or groups and set time limits and availability windows. Students receive notifications when new exams are assigned to them.',
                    color: '#ff6d00',
                    icon: <Timer fontSize="large" />,
                  },
                  {
                    number: '03',
                    title: 'Take Exams',
                    description: 'Students log in, access their assigned exams, and complete them within the specified time limits. The platform works on computers, tablets, and smartphones.',
                    color: '#00c853',
                    icon: <Assessment fontSize="large" />,
                  },
                  {
                    number: '04',
                    title: 'AI-Powered Grading',
                    description: 'Our system automatically grades multiple-choice questions and uses AI to evaluate open-ended responses with remarkable accuracy, even in Kinyarwanda.',
                    color: '#2196f3',
                    icon: <Psychology fontSize="large" />,
                  },
                  {
                    number: '05',
                    title: 'Review Results',
                    description: 'Both administrators and students can review detailed results and performance analytics. Generate reports and identify areas for improvement.',
                    color: '#9c27b0',
                    icon: <EmojiEvents fontSize="large" />,
                  },
                ].map((step, index) => (
                  <Grow in={true} style={{ transitionDelay: `${index * 200}ms` }} key={index}>
                    <Box sx={{ display: 'flex', mb: 5, alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                      <Box
                        sx={{
                          bgcolor: 'white',
                          color: step.color,
                          width: 60,
                          height: 60,
                          borderRadius: '50%',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          fontWeight: 'bold',
                          mr: 3,
                          flexShrink: 0,
                          boxShadow: `0 8px 20px ${step.color}30`,
                          border: `2px solid ${step.color}`,
                          fontSize: '1.2rem',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.1)',
                            boxShadow: `0 10px 25px ${step.color}40`,
                          }
                        }}
                      >
                        {step.number}
                      </Box>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Avatar
                            sx={{
                              bgcolor: `${step.color}15`,
                              color: step.color,
                              mr: 1.5,
                              width: 36,
                              height: 36,
                            }}
                          >
                            {step.icon}
                          </Avatar>
                          <Typography
                            variant="h5"
                            component="h3"
                            fontWeight="bold"
                            sx={{
                              color: step.color,
                            }}
                          >
                            {step.title}
                          </Typography>
                        </Box>
                        <Typography
                          variant="body1"
                          color="text.secondary"
                          sx={{
                            ml: 0.5,
                            lineHeight: 1.6,
                          }}
                        >
                          {step.description}
                        </Typography>
                      </Box>
                    </Box>
                  </Grow>
                ))}
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ textAlign: 'center', mt: 8 }}>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              component={RouterLink}
              to="/login"
              endIcon={<ArrowForward />}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 50,
                fontWeight: 'bold',
                boxShadow: '0 8px 20px rgba(255, 109, 0, 0.3)',
                color: 'black',
              }}
            >
              Get Started Now
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Call to Action */}
      <Box
        sx={{
          position: 'relative',
          color: 'white',
          py: 12,
          textAlign: 'center',
          overflow: 'hidden',
          background: 'url(https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80) center center/cover no-repeat',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, rgba(74, 20, 140, 0.9) 0%, rgba(124, 67, 189, 0.85) 100%)',
            zIndex: 1,
          }
        }}
      >
        {/* Animated particles */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 2,
            overflow: 'hidden',
          }}
        >
          {[...Array(15)].map((_, index) => (
            <Box
              key={index}
              sx={{
                position: 'absolute',
                width: Math.random() * 10 + 5,
                height: Math.random() * 10 + 5,
                background: 'rgba(255, 255, 255, 0.3)',
                borderRadius: '50%',
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: `float ${Math.random() * 10 + 10}s infinite ease-in-out ${Math.random() * 5}s,
                           pulse ${Math.random() * 5 + 5}s infinite alternate ${Math.random() * 5}s`,
              }}
            />
          ))}
        </Box>

        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 3 }}>
          <Zoom in={true}>
            <Box
              sx={{
                p: { xs: 4, md: 6 },
                borderRadius: 6,
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.2)',
                maxWidth: 800,
                mx: 'auto',
              }}
            >
              <Typography
                variant="h2"
                component="h2"
                fontWeight="bold"
                gutterBottom
                sx={{
                  fontSize: { xs: '2.2rem', sm: '2.5rem', md: '3.2rem' },
                  textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                  mb: 3,
                }}
              >
                Ready to Transform Education in Rwanda?
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  mb: 5,
                  opacity: 0.9,
                  maxWidth: 600,
                  mx: 'auto',
                  lineHeight: 1.6,
                }}
              >
                Join hundreds of institutions already using Testify to revolutionize their examination process with AI-powered grading
              </Typography>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 3 }}>
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  component={RouterLink}
                  to="/register"
                  endIcon={<ArrowForward />}
                  sx={{
                    color: 'black',
                    fontWeight: 'bold',
                    px: 5,
                    py: 2,
                    fontSize: '1.2rem',
                    borderRadius: '50px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3), 0 0 0 5px rgba(255, 109, 0, 0.3)',
                    background: 'linear-gradient(45deg, #ff6d00, #ffab40)',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 15px 30px rgba(0, 0, 0, 0.4), 0 0 0 5px rgba(255, 109, 0, 0.5)',
                      transform: 'translateY(-5px) scale(1.03)',
                    }
                  }}
                >
                  Start Your Free Trial
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<Phone />}
                  sx={{
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    borderWidth: '2px',
                    color: 'white',
                    px: 4,
                    py: 2,
                    fontSize: '1.2rem',
                    borderRadius: '50px',
                    backdropFilter: 'blur(5px)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: 'white',
                      background: 'rgba(255, 255, 255, 0.2)',
                      transform: 'translateY(-5px)',
                      boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)',
                    }
                  }}
                >
                  Schedule a Demo
                </Button>
              </Box>

              <Box sx={{ mt: 5, display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CheckCircle sx={{ color: 'secondary.main', mr: 1 }} />
                  <Typography variant="body1" fontWeight="medium">
                    14-day free trial
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CheckCircle sx={{ color: 'secondary.main', mr: 1 }} />
                  <Typography variant="body1" fontWeight="medium">
                    No credit card required
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CheckCircle sx={{ color: 'secondary.main', mr: 1 }} />
                  <Typography variant="body1" fontWeight="medium">
                    Full feature access
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Zoom>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box
        id="testimonials"
        sx={{
          py: 14,
          position: 'relative',
          background: 'url(https://images.unsplash.com/photo-1517842645767-c639042777db?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80) center center/cover no-repeat',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(to bottom, rgba(248, 249, 250, 0.95), rgba(248, 249, 250, 0.85))',
            zIndex: 1,
          }
        }}
      >
        {/* Decorative elements */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: `
              radial-gradient(circle at 10% 10%, rgba(74, 20, 140, 0.03) 0%, transparent 20%),
              radial-gradient(circle at 90% 90%, rgba(255, 109, 0, 0.03) 0%, transparent 20%)
            `,
            zIndex: 2,
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 3 }}>
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Chip
              label="TESTIMONIALS"
              color="primary"
              sx={{
                mb: 2,
                fontWeight: 'bold',
                px: 2,
                py: 0.8,
                borderRadius: '50px',
                background: 'linear-gradient(90deg, #4a148c, #7c43bd)',
                color: 'white',
                boxShadow: '0 4px 10px rgba(74, 20, 140, 0.3)',
              }}
            />
            <Typography
              variant="h2"
              component="h2"
              fontWeight="bold"
              gutterBottom
              sx={{
                fontSize: { xs: '2.2rem', sm: '2.5rem', md: '3rem' },
                background: 'linear-gradient(90deg, #4a148c, #7c43bd)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2,
              }}
            >
              Voices from Rwanda's Educators
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{
                maxWidth: 700,
                mx: 'auto',
                fontSize: { xs: '1rem', md: '1.1rem' },
                lineHeight: 1.6,
              }}
            >
              Hear from teachers and students across Rwanda who are transforming education with Testify
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {[
              {
                name: 'Dr. Jean-Paul Mugisha',
                role: 'Professor at University of Rwanda',
                image: 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?ixlib=rb-1.2.1&auto=format&fit=crop&w=240&q=80',
                quote: 'Testify has transformed our examination process at the University of Rwanda. The AI grading system is remarkably accurate and has reduced our grading time by 70%. Our students appreciate the immediate feedback.',
                rating: 5,
                color: '#4a148c',
                icon: <School />,
              },
              {
                name: 'Marie Uwimana',
                role: 'Secondary School Teacher, Kigali',
                image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?ixlib=rb-1.2.1&auto=format&fit=crop&w=240&q=80',
                quote: 'As a teacher in Rwanda, I\'ve seen how Testify bridges the technology gap in education. My students are more engaged, and the platform works well even with our occasional internet challenges.',
                rating: 5,
                color: '#ff6d00',
                icon: <MenuBook />,
              },
              {
                name: 'Emmanuel Ndayishimiye',
                role: 'Computer Science Student, AUCA',
                image: 'https://images.unsplash.com/photo-1507152832244-10d45c7eda57?ixlib=rb-1.2.1&auto=format&fit=crop&w=240&q=80',
                quote: 'Testify has made exam-taking less stressful. I can focus on demonstrating my knowledge rather than worrying about the process. The interface is clean and works well on my smartphone too!',
                rating: 5,
                color: '#00c853',
                icon: <Laptop />,
              }
            ].map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Zoom in={true} style={{ transitionDelay: `${index * 200}ms` }}>
                  <Card
                    elevation={6}
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 4,
                      overflow: 'hidden',
                      position: 'relative',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-10px)',
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '6px',
                        background: `linear-gradient(90deg, ${testimonial.color}, ${testimonial.color}80)`,
                      }
                    }}
                  >
                    <CardContent sx={{ p: 4, flexGrow: 1 }}>
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 20,
                          right: 20,
                          opacity: 0.1,
                          fontSize: '6rem',
                          color: testimonial.color,
                        }}
                      >
                        <FormatQuote />
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Avatar
                          src={testimonial.image}
                          alt={testimonial.name}
                          sx={{
                            width: 70,
                            height: 70,
                            mr: 2,
                            boxShadow: `0 4px 15px ${testimonial.color}40`,
                            border: `3px solid ${testimonial.color}`,
                          }}
                        />
                        <Box>
                          <Typography variant="h6" component="h3" fontWeight="bold" sx={{ color: testimonial.color }}>
                            {testimonial.name}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                            <Avatar
                              sx={{
                                width: 24,
                                height: 24,
                                mr: 1,
                                bgcolor: `${testimonial.color}20`,
                                color: testimonial.color,
                              }}
                            >
                              {testimonial.icon}
                            </Avatar>
                            <Typography variant="body2" color="text.secondary" fontWeight="medium">
                              {testimonial.role}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      <Typography
                        variant="body1"
                        paragraph
                        sx={{
                          mb: 3,
                          lineHeight: 1.7,
                          position: 'relative',
                          pl: 2,
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '3px',
                            height: '100%',
                            background: `linear-gradient(to bottom, ${testimonial.color}, transparent)`,
                            borderRadius: '3px',
                          }
                        }}
                      >
                        "{testimonial.quote}"
                      </Typography>

                      <Box sx={{ display: 'flex', mt: 'auto' }}>
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            sx={{
                              color: i < testimonial.rating ? testimonial.color : 'rgba(0,0,0,0.1)',
                              fontSize: 22,
                              mr: 0.5,
                            }}
                          />
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Zoom>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ textAlign: 'center', mt: 8 }}>
            <Button
              variant="outlined"
              color="primary"
              size="large"
              endIcon={<ArrowForward />}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 50,
                fontWeight: 'bold',
                borderWidth: '2px',
                '&:hover': {
                  borderWidth: '2px',
                  background: 'rgba(74, 20, 140, 0.05)',
                }
              }}
            >
              Read More Success Stories
            </Button>
          </Box>
        </Container>
      </Box>



      {/* FAQ Section */}
      <Box
        id="faq"
        sx={{
          py: 14,
          position: 'relative',
          background: 'linear-gradient(135deg, #f8f9fa 0%, #f0f2f5 100%)',
          overflow: 'hidden',
        }}
      >
        {/* Decorative elements */}
        <Box
          sx={{
            position: 'absolute',
            top: '10%',
            left: '5%',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(74, 20, 140, 0.03) 0%, transparent 70%)',
            zIndex: 0,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '10%',
            right: '5%',
            width: '250px',
            height: '250px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255, 109, 0, 0.03) 0%, transparent 70%)',
            zIndex: 0,
          }}
        />

        {/* Floating shapes */}
        <Box
          sx={{
            position: 'absolute',
            top: '20%',
            right: '10%',
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            background: 'rgba(74, 20, 140, 0.05)',
            transform: 'rotate(45deg)',
            animation: 'float 10s infinite ease-in-out',
            zIndex: 0,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '15%',
            left: '10%',
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            background: 'rgba(255, 109, 0, 0.05)',
            animation: 'float 8s infinite ease-in-out 1s',
            zIndex: 0,
          }}
        />

        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Chip
              label="FAQ"
              color="secondary"
              sx={{
                mb: 2,
                fontWeight: 'bold',
                px: 2,
                py: 0.8,
                borderRadius: '50px',
                background: 'linear-gradient(90deg, #ff6d00, #ff9e40)',
                color: 'black',
                boxShadow: '0 4px 10px rgba(255, 109, 0, 0.3)',
              }}
            />
            <Typography
              variant="h2"
              component="h2"
              fontWeight="bold"
              gutterBottom
              sx={{
                fontSize: { xs: '2.2rem', sm: '2.5rem', md: '3rem' },
                background: 'linear-gradient(90deg, #4a148c, #7c43bd)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2,
              }}
            >
              Frequently Asked Questions
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{
                maxWidth: 700,
                mx: 'auto',
                fontSize: { xs: '1rem', md: '1.1rem' },
                lineHeight: 1.6,
              }}
            >
              Find answers to common questions about Testify's features and capabilities
            </Typography>
          </Box>

          <Box
            sx={{
              mt: 4,
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 20,
                left: -50,
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: 'rgba(74, 20, 140, 0.03)',
                zIndex: -1,
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: 20,
                right: -50,
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: 'rgba(255, 109, 0, 0.03)',
                zIndex: -1,
              }
            }}
          >
            {[
              {
                question: 'How does the AI grading system work?',
                answer: 'Our AI grading system uses advanced natural language processing and machine learning algorithms to evaluate open-ended responses. It compares student answers against model answers and rubrics, considering factors like content accuracy, relevance, and language usage. The system continuously improves through machine learning, becoming more accurate over time.',
                icon: <Psychology />,
                color: '#4a148c'
              },
              {
                question: 'Is Testify secure for high-stakes exams?',
                answer: 'Yes, Testify is designed with security as a top priority. We implement multiple security measures including encrypted connections, browser lockdown options, randomized question ordering, and AI-powered proctoring to detect suspicious behavior. Our platform complies with educational data privacy regulations and undergoes regular security audits.',
                icon: <Security />,
                color: '#f44336'
              },
              {
                question: 'Can I integrate Testify with my existing LMS?',
                answer: 'Absolutely! Testify offers seamless integration with popular Learning Management Systems like Canvas, Blackboard, Moodle, and Google Classroom. Our API allows for custom integrations with other systems as well. The Professional and Enterprise plans include full API access and integration support.',
                icon: <Link />,
                color: '#2196f3'
              },
              {
                question: 'What types of questions can I create?',
                answer: 'Testify supports a wide variety of question types including multiple choice, true/false, matching, short answer, essay, file upload, coding questions, mathematical equations, and more. You can also include multimedia elements like images, audio, and video in your questions.',
                icon: <QuestionAnswer />,
                color: '#ff6d00'
              },
              {
                question: 'How can students access their exams?',
                answer: 'Students can access their exams through any modern web browser on computers, tablets, or smartphones. They simply log in to their Testify account using their credentials, and they\'ll see all their assigned exams on their dashboard. No special software installation is required.',
                icon: <Devices />,
                color: '#00c853'
              },
              {
                question: 'What kind of analytics and reports are available?',
                answer: 'Testify provides comprehensive analytics including individual student performance, class-wide statistics, question difficulty analysis, time spent per question, and learning outcome achievement. Reports can be viewed online or exported in various formats including PDF, Excel, and CSV.',
                icon: <Assessment />,
                color: '#9c27b0'
              }
            ].map((faq, index) => (
              <Zoom in={true} style={{ transitionDelay: `${index * 100}ms` }} key={index}>
                <Accordion
                  elevation={3}
                  sx={{
                    mb: 3,
                    borderRadius: 3,
                    overflow: 'hidden',
                    '&:before': { display: 'none' },
                    border: '1px solid rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)',
                    },
                    '&.Mui-expanded': {
                      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                      borderLeft: `4px solid ${faq.color}`,
                    }
                  }}
                >
                  <AccordionSummary
                    expandIcon={
                      <Avatar
                        sx={{
                          bgcolor: 'white',
                          color: faq.color,
                          width: 28,
                          height: 28,
                          boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                          '& .MuiSvgIcon-root': {
                            fontSize: '1.2rem',
                          }
                        }}
                      >
                        <ExpandMore />
                      </Avatar>
                    }
                    sx={{
                      px: 3,
                      py: 2,
                      '&.Mui-expanded': {
                        bgcolor: `${faq.color}10`,
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar
                        sx={{
                          bgcolor: `${faq.color}15`,
                          color: faq.color,
                          mr: 2,
                          boxShadow: `0 4px 8px ${faq.color}20`,
                        }}
                      >
                        {faq.icon}
                      </Avatar>
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        sx={{
                          color: 'text.primary',
                          fontSize: { xs: '1rem', md: '1.1rem' },
                        }}
                      >
                        {faq.question}
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{
                        pl: 7,
                        position: 'relative',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 20,
                          width: 2,
                          height: '100%',
                          background: `linear-gradient(to bottom, ${faq.color}, transparent)`,
                        }
                      }}
                    >
                      {faq.answer}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              </Zoom>
            ))}
          </Box>

          <Box
            sx={{
              textAlign: 'center',
              mt: 8,
              p: 4,
              borderRadius: 4,
              background: 'linear-gradient(135deg, rgba(74, 20, 140, 0.05) 0%, rgba(255, 109, 0, 0.05) 100%)',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
            }}
          >
            <Typography variant="h5" fontWeight="bold" gutterBottom color="primary.main">
              Still have questions?
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ maxWidth: 600, mx: 'auto', mb: 3 }}>
              Our team is ready to help you with any questions you might have about Testify.
              Feel free to reach out to us anytime.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => scrollToSection('contact')}
              endIcon={<ArrowForward />}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 50,
                fontWeight: 'bold',
                boxShadow: '0 8px 20px rgba(74, 20, 140, 0.3)',
              }}
            >
              Contact Our Team
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Contact Section */}
      <Box
        id="contact"
        sx={{
          py: 14,
          position: 'relative',
          background: 'url(https://images.unsplash.com/photo-1596524430615-b46475ddff6e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80) center center/cover no-repeat',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, rgba(74, 20, 140, 0.9) 0%, rgba(124, 67, 189, 0.85) 100%)',
            zIndex: 1,
          }
        }}
      >
        {/* Decorative elements */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: `
              radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 10%),
              radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 15%),
              radial-gradient(circle at 40% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 15%),
              radial-gradient(circle at 70% 90%, rgba(255, 255, 255, 0.1) 0%, transparent 10%)
            `,
            zIndex: 2,
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 3 }}>
          <Box sx={{ textAlign: 'center', mb: 8, color: 'white' }}>
            <Chip
              label="CONTACT US"
              color="secondary"
              sx={{
                mb: 2,
                fontWeight: 'bold',
                px: 2,
                py: 0.8,
                borderRadius: '50px',
                background: 'linear-gradient(90deg, #ff6d00, #ff9e40)',
                color: 'black',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
              }}
            />
            <Typography
              variant="h2"
              component="h2"
              fontWeight="bold"
              gutterBottom
              sx={{
                fontSize: { xs: '2.2rem', sm: '2.5rem', md: '3rem' },
                mb: 2,
                textShadow: '0 2px 10px rgba(0,0,0,0.3)',
              }}
            >
              Get In Touch With Our Team
            </Typography>
            <Typography
              variant="h6"
              sx={{
                maxWidth: 700,
                mx: 'auto',
                fontSize: { xs: '1rem', md: '1.1rem' },
                lineHeight: 1.6,
                opacity: 0.9,
              }}
            >
              We'd love to hear from you. Contact us for any questions or to schedule a demo of Testify.
            </Typography>
          </Box>

          <Grid container spacing={6} sx={{ mt: 2 }}>
            <Grid item xs={12} md={6}>
              <Card
                elevation={8}
                sx={{
                  borderRadius: 4,
                  overflow: 'hidden',
                  height: '100%',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-10px)',
                  }
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h4" component="h3" fontWeight="bold" gutterBottom color="primary.main">
                    Send Us a Message
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4 }}>
                    Fill out the form below and we'll get back to you as soon as possible.
                  </Typography>

                  <Box sx={{ mt: 4 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Your Name"
                          variant="outlined"
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
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'primary.main',
                              },
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Email Address"
                          variant="outlined"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Email color="primary" />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'primary.main',
                              },
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Subject"
                          variant="outlined"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Subject color="primary" />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'primary.main',
                              },
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Message"
                          variant="outlined"
                          multiline
                          rows={5}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'primary.main',
                              },
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Button
                          variant="contained"
                          color="primary"
                          size="large"
                          endIcon={<Send />}
                          fullWidth
                          sx={{
                            py: 1.8,
                            borderRadius: 50,
                            fontWeight: 'bold',
                            boxShadow: '0 8px 20px rgba(74, 20, 140, 0.3)',
                            '&:hover': {
                              boxShadow: '0 10px 25px rgba(74, 20, 140, 0.4)',
                              transform: 'translateY(-3px)',
                            }
                          }}
                        >
                          Send Message
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  color: 'white',
                }}
              >
                <Typography variant="h4" component="h3" fontWeight="bold" gutterBottom>
                  Contact Information
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9, mb: 4 }}>
                  Reach out to us directly using any of the contact methods below. Our team is available to assist you Monday through Friday, 8:00 AM to 6:00 PM (Rwanda Time).
                </Typography>

                <Box
                  sx={{
                    mt: 2,
                    p: 3,
                    borderRadius: 4,
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                    <Avatar
                      sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        mr: 2,
                        width: 56,
                        height: 56,
                        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                      }}
                    >
                      <Email fontSize="large" />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Email Us At
                      </Typography>
                      <Typography variant="h6" fontWeight="medium">
                        info@nationalscore.rw
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                    <Avatar
                      sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        mr: 2,
                        width: 56,
                        height: 56,
                        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                      }}
                    >
                      <Phone fontSize="large" />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Call Us At
                      </Typography>
                      <Typography variant="h6" fontWeight="medium">
                        +250 788 123 456
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                      sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        mr: 2,
                        width: 56,
                        height: 56,
                        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                      }}
                    >
                      <LocationOn fontSize="large" />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Visit Our Office
                      </Typography>
                      <Typography variant="h6" fontWeight="medium">
                        Kigali Heights, KG 7 Ave<br />
                        Kigali, Rwanda
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ mt: 6 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Connect With Us
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    {[
                      { icon: <Facebook />, color: '#1877F2', label: 'Facebook' },
                      { icon: <Twitter />, color: '#1DA1F2', label: 'Twitter' },
                      { icon: <LinkedIn />, color: '#0A66C2', label: 'LinkedIn' },
                      { icon: <Instagram />, color: '#E4405F', label: 'Instagram' }
                    ].map((social, index) => (
                      <Tooltip key={index} title={social.label}>
                        <IconButton
                          sx={{
                            bgcolor: 'rgba(255, 255, 255, 0.1)',
                            color: 'white',
                            width: 48,
                            height: 48,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              bgcolor: social.color,
                              transform: 'translateY(-5px)',
                              boxShadow: '0 8px 15px rgba(0, 0, 0, 0.2)',
                            }
                          }}
                        >
                          {social.icon}
                        </IconButton>
                      </Tooltip>
                    ))}
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          bgcolor: '#12005e',
          color: 'white',
          pt: 10,
          pb: 6,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'url(https://www.transparenttextures.com/patterns/cubes.png)',
            opacity: 0.05,
            zIndex: 1,
          }
        }}
      >
        {/* Decorative elements */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '10px',
            background: 'linear-gradient(90deg, #4a148c, #7c43bd, #ff6d00, #ffab40)',
            zIndex: 2,
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Grid container spacing={6}>
            <Grid item xs={12} md={4}>
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar
                    sx={{
                      bgcolor: 'secondary.main',
                      mr: 1.5,
                      width: 50,
                      height: 50,
                      boxShadow: '0 4px 10px rgba(255, 109, 0, 0.3)',
                    }}
                  >
                    <School fontSize="large" />
                  </Avatar>
                  <Typography
                    variant="h4"
                    component="div"
                    fontWeight="bold"
                    sx={{
                      background: 'linear-gradient(90deg, #ffffff, #e0e0ff)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Testify
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ mb: 3, opacity: 0.9, maxWidth: 350, lineHeight: 1.6 }}>
                  Revolutionizing online examinations in Rwanda with AI-powered grading and comprehensive management tools.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  {[
                    { icon: <Facebook />, color: '#1877F2', label: 'Facebook' },
                    { icon: <Twitter />, color: '#1DA1F2', label: 'Twitter' },
                    { icon: <LinkedIn />, color: '#0A66C2', label: 'LinkedIn' },
                    { icon: <Instagram />, color: '#E4405F', label: 'Instagram' }
                  ].map((social, index) => (
                    <Tooltip key={index} title={social.label}>
                      <IconButton
                        sx={{
                          bgcolor: 'rgba(255, 255, 255, 0.05)',
                          color: 'white',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            bgcolor: social.color,
                            transform: 'translateY(-5px)',
                          }
                        }}
                      >
                        {social.icon}
                      </IconButton>
                    </Tooltip>
                  ))}
                </Box>
              </Box>

              <Box
                sx={{
                  mt: 5,
                  p: 3,
                  borderRadius: 4,
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Subscribe to Our Newsletter
                </Typography>
                <Typography variant="body2" sx={{ mb: 2, opacity: 0.8 }}>
                  Stay updated with the latest features and news
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    placeholder="Your email"
                    variant="outlined"
                    size="small"
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: 'rgba(255, 255, 255, 0.05)',
                        color: 'white',
                        '& fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.2)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: 'primary.main',
                        },
                      },
                      '& .MuiInputBase-input::placeholder': {
                        color: 'rgba(255, 255, 255, 0.5)',
                      },
                    }}
                  />
                  <Button
                    variant="contained"
                    color="secondary"
                    sx={{
                      color: 'black',
                      fontWeight: 'bold',
                      minWidth: 'auto',
                      px: 2,
                    }}
                  >
                    <Send />
                  </Button>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={8}>
              <Grid container spacing={4}>
                <Grid item xs={6} sm={3}>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    gutterBottom
                    sx={{
                      color: 'secondary.main',
                      pb: 1,
                      borderBottom: '2px solid',
                      borderColor: 'secondary.main',
                      display: 'inline-block',
                    }}
                  >
                    Product
                  </Typography>
                  <List disablePadding dense>
                    {[
                      { name: 'Features', section: 'features' },
                      { name: 'How It Works', section: 'how-it-works' },
                      { name: 'Testimonials', section: 'testimonials' },
                      { name: 'FAQ', section: 'faq' },
                      { name: 'Demo', section: '' }
                    ].map((item, index) => (
                      <ListItem key={index} disablePadding disableGutters sx={{ mb: 1.5 }}>
                        <Button
                          color="inherit"
                          onClick={() => item.section ? scrollToSection(item.section) : null}
                          sx={{
                            p: 0,
                            justifyContent: 'flex-start',
                            opacity: 0.8,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              opacity: 1,
                              pl: 1,
                              color: 'secondary.main',
                            }
                          }}
                        >
                          {item.name}
                        </Button>
                      </ListItem>
                    ))}
                  </List>
                </Grid>

                <Grid item xs={6} sm={3}>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    gutterBottom
                    sx={{
                      color: 'secondary.main',
                      pb: 1,
                      borderBottom: '2px solid',
                      borderColor: 'secondary.main',
                      display: 'inline-block',
                    }}
                  >
                    Company
                  </Typography>
                  <List disablePadding dense>
                    {['About Us', 'Our Team', 'Careers', 'Blog', 'Contact'].map((item, index) => (
                      <ListItem key={index} disablePadding disableGutters sx={{ mb: 1.5 }}>
                        <Button
                          color="inherit"
                          sx={{
                            p: 0,
                            justifyContent: 'flex-start',
                            opacity: 0.8,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              opacity: 1,
                              pl: 1,
                              color: 'secondary.main',
                            }
                          }}
                        >
                          {item}
                        </Button>
                      </ListItem>
                    ))}
                  </List>
                </Grid>

                <Grid item xs={6} sm={3}>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    gutterBottom
                    sx={{
                      color: 'secondary.main',
                      pb: 1,
                      borderBottom: '2px solid',
                      borderColor: 'secondary.main',
                      display: 'inline-block',
                    }}
                  >
                    Resources
                  </Typography>
                  <List disablePadding dense>
                    {['Documentation', 'Guides', 'API', 'Support', 'Webinars'].map((item, index) => (
                      <ListItem key={index} disablePadding disableGutters sx={{ mb: 1.5 }}>
                        <Button
                          color="inherit"
                          sx={{
                            p: 0,
                            justifyContent: 'flex-start',
                            opacity: 0.8,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              opacity: 1,
                              pl: 1,
                              color: 'secondary.main',
                            }
                          }}
                        >
                          {item}
                        </Button>
                      </ListItem>
                    ))}
                  </List>
                </Grid>

                <Grid item xs={6} sm={3}>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    gutterBottom
                    sx={{
                      color: 'secondary.main',
                      pb: 1,
                      borderBottom: '2px solid',
                      borderColor: 'secondary.main',
                      display: 'inline-block',
                    }}
                  >
                    Legal
                  </Typography>
                  <List disablePadding dense>
                    {['Terms', 'Privacy', 'Cookies', 'Licenses', 'Settings'].map((item, index) => (
                      <ListItem key={index} disablePadding disableGutters sx={{ mb: 1.5 }}>
                        <Button
                          color="inherit"
                          sx={{
                            p: 0,
                            justifyContent: 'flex-start',
                            opacity: 0.8,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              opacity: 1,
                              pl: 1,
                              color: 'secondary.main',
                            }
                          }}
                        >
                          {item}
                        </Button>
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              </Grid>

              <Box
                sx={{
                  mt: 6,
                  p: 3,
                  borderRadius: 4,
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 2,
                }}
              >
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    Ready to get started?
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Start your 14-day free trial today
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  component={RouterLink}
                  to="/register"
                  endIcon={<ArrowForward />}
                  sx={{
                    color: 'black',
                    fontWeight: 'bold',
                    borderRadius: '50px',
                    px: 3,
                  }}
                >
                  Sign Up Free
                </Button>
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 6, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'center', sm: 'flex-start' } }}>
            <Typography variant="body2" sx={{ opacity: 0.7, mb: { xs: 2, sm: 0 } }}>
              © {new Date().getFullYear()} Testify. All rights reserved.
            </Typography>
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <Button
                color="inherit"
                size="small"
                sx={{
                  opacity: 0.7,
                  minWidth: 'auto',
                  '&:hover': {
                    opacity: 1,
                    color: 'secondary.main',
                  }
                }}
              >
                Terms
              </Button>
              <Button
                color="inherit"
                size="small"
                sx={{
                  opacity: 0.7,
                  minWidth: 'auto',
                  '&:hover': {
                    opacity: 1,
                    color: 'secondary.main',
                  }
                }}
              >
                Privacy
              </Button>
              <Button
                color="inherit"
                size="small"
                sx={{
                  opacity: 0.7,
                  minWidth: 'auto',
                  '&:hover': {
                    opacity: 1,
                    color: 'secondary.main',
                  }
                }}
              >
                Cookies
              </Button>
              <Button
                color="inherit"
                size="small"
                sx={{
                  opacity: 0.7,
                  minWidth: 'auto',
                  '&:hover': {
                    opacity: 1,
                    color: 'secondary.main',
                  }
                }}
              >
                Sitemap
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
