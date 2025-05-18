import React, { useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Tooltip,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  Badge,
  alpha,
  Collapse,
  Button
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  School,
  Assessment,
  Person,
  Logout,
  ExpandLess,
  ExpandMore,
  Notifications,
  Settings,
  Help,
  ChevronLeft,
  ChevronRight,
  Assignment,
  EmojiEvents,
  History,
  AccountCircle
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const drawerWidth = 260;

const StudentLayout = ({ children }) => {
  const theme = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);
  const [examSubmenuOpen, setExamSubmenuOpen] = useState(true);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationsOpen = (event) => {
    setNotificationsAnchorEl(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchorEl(null);
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    logout();
  };

  const toggleExamSubmenu = () => {
    setExamSubmenuOpen(!examSubmenuOpen);
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const drawer = (
    <Box sx={{
      overflow: 'auto',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: '#f8f9fa', // Light background for the drawer
      borderRight: '1px solid rgba(0, 0, 0, 0.08)' // Subtle border
    }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          padding: theme.spacing(3),
          background: 'linear-gradient(135deg, #4a148c 0%, #7c43bd 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 0, // Remove rounded corners
        }}
      >
        {/* Decorative elements */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '100px',
            height: '100px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            borderRadius: '50%',
            transform: 'translate(30%, -30%)',
          }}
        />

        <Avatar
          sx={{
            bgcolor: 'secondary.main',
            width: 45,
            height: 45,
            mr: 2,
            boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
            border: '2px solid rgba(255,255,255,0.2)',
          }}
        >
          <School sx={{ fontSize: 24 }} />
        </Avatar>
        <Typography variant="h6" fontWeight="bold" noWrap sx={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
          Testify
        </Typography>
        {isMobile && (
          <IconButton
            onClick={handleDrawerToggle}
            sx={{
              ml: 'auto',
              color: 'white',
              bgcolor: 'rgba(255,255,255,0.1)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
            }}
          >
            {theme.direction === 'ltr' ? <ChevronLeft /> : <ChevronRight />}
          </IconButton>
        )}
      </Box>
      <Divider />

      <Box sx={{ p: 3 }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          mb: 2,
          p: 2,
          borderRadius: 0, // Remove rounded corners
          bgcolor: 'primary.lighter',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        }}>
          <Avatar
            sx={{
              width: 60,
              height: 60,
              bgcolor: 'secondary.main',
              boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
              border: '3px solid white',
              mr: 2
            }}
          >
            {user?.firstName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'S'}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">
              {user?.firstName ? `${user.firstName} ${user.lastName}` : user?.email || 'Student'}
            </Typography>
            <Typography variant="body2" sx={{
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              fontWeight: 'medium'
            }}>
              <School fontSize="small" /> Student
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider />

      <List component="nav" sx={{
        px: 2,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          left: '10px',
          top: '10px',
          bottom: '10px',
          width: '1px',
          background: 'linear-gradient(to bottom, transparent, rgba(74, 20, 140, 0.2), transparent)',
          zIndex: 0
        }
      }}>
        <Typography
          variant="overline"
          sx={{
            pl: 2,
            opacity: 0.7,
            fontWeight: 'bold',
            letterSpacing: 1,
            display: 'block',
            mb: 1
          }}
        >
          MAIN MENU
        </Typography>

        <ListItem disablePadding sx={{ mb: 1 }}>
          <ListItemButton
            component={RouterLink}
            to="/student/dashboard"
            selected={isActive('/student/dashboard') || isActive('/student')}
            sx={{
              borderRadius: 0, // Remove rounded corners
              py: 1.5, // Increase padding for better touch targets
              mb: 0.5, // Add margin between items
              '&.Mui-selected': {
                background: 'linear-gradient(90deg, rgba(74, 20, 140, 0.1) 0%, rgba(74, 20, 140, 0.2) 100%)',
                color: 'primary.main',
                borderLeft: '4px solid', // Add left border for selected items
                borderColor: 'primary.main',
                '&:hover': {
                  background: 'linear-gradient(90deg, rgba(74, 20, 140, 0.15) 0%, rgba(74, 20, 140, 0.25) 100%)',
                },
                '& .MuiListItemIcon-root': {
                  color: 'primary.main',
                },
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              },
              '&:hover': {
                background: 'rgba(0, 0, 0, 0.04)',
                borderLeft: '4px solid', // Add left border on hover
                borderColor: 'rgba(74, 20, 140, 0.3)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            <ListItemIcon>
              <Avatar
                sx={{
                  bgcolor: isActive('/student/dashboard') || isActive('/student') ? 'primary.lighter' : 'transparent',
                  color: isActive('/student/dashboard') || isActive('/student') ? 'primary.main' : 'action.active',
                  width: 32,
                  height: 32,
                }}
              >
                <DashboardIcon fontSize="small" />
              </Avatar>
            </ListItemIcon>
            <ListItemText
              primary="Dashboard"
              primaryTypographyProps={{
                fontWeight: isActive('/student/dashboard') || isActive('/student') ? 'bold' : 'medium'
              }}
            />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding sx={{ mb: 1 }}>
          <ListItemButton
            onClick={toggleExamSubmenu}
            sx={{
              borderRadius: 0, // Remove rounded corners
              py: 1.5, // Increase padding for better touch targets
              mb: 0.5, // Add margin between items
              ...(isActive('/student/exams') || isActive('/student/exam') || isActive('/student/results') || isActive('/student/history') ? {
                background: 'linear-gradient(90deg, rgba(74, 20, 140, 0.1) 0%, rgba(74, 20, 140, 0.2) 100%)',
                color: 'primary.main',
                borderLeft: '4px solid', // Add left border for selected items
                borderColor: 'primary.main',
                '& .MuiListItemIcon-root': {
                  color: 'primary.main',
                },
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              } : {}),
              '&:hover': {
                background: 'rgba(0, 0, 0, 0.04)',
                borderLeft: '4px solid', // Add left border on hover
                borderColor: 'rgba(74, 20, 140, 0.3)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            <ListItemIcon>
              <Avatar
                sx={{
                  bgcolor: isActive('/student/exams') || isActive('/student/exam') || isActive('/student/results') || isActive('/student/history') ? 'primary.lighter' : 'transparent',
                  color: isActive('/student/exams') || isActive('/student/exam') || isActive('/student/results') || isActive('/student/history') ? 'primary.main' : 'action.active',
                  width: 32,
                  height: 32,
                }}
              >
                <Assignment fontSize="small" />
              </Avatar>
            </ListItemIcon>
            <ListItemText
              primary="Exams"
              primaryTypographyProps={{
                fontWeight: isActive('/student/exams') || isActive('/student/exam') || isActive('/student/results') || isActive('/student/history') ? 'bold' : 'medium'
              }}
            />
            {examSubmenuOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </ListItem>

        <Collapse in={examSubmenuOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding sx={{ ml: 2, mt: 1 }}>
            <ListItemButton
              component={RouterLink}
              to="/student/exams"
              selected={isActive('/student/exams')}
              sx={{
                pl: 2,
                borderRadius: 0, // Remove rounded corners
                mb: 1,
                py: 1.2, // Increase padding for better touch targets
                '&.Mui-selected': {
                  backgroundColor: 'primary.lighter',
                  color: 'primary.main',
                  borderLeft: '3px solid', // Add left border for selected items
                  borderColor: 'primary.main',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                },
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  borderLeft: '3px solid', // Add left border on hover
                  borderColor: 'rgba(74, 20, 140, 0.3)',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <School fontSize="small" color={isActive('/student/exams') ? 'primary' : 'inherit'} />
              </ListItemIcon>
              <ListItemText
                primary="Available Exams"
                primaryTypographyProps={{
                  fontSize: '0.9rem',
                  fontWeight: isActive('/student/exams') ? 'bold' : 'medium'
                }}
              />
            </ListItemButton>

            <ListItemButton
              component={RouterLink}
              to="/student/results"
              selected={isActive('/student/results')}
              sx={{
                pl: 2,
                borderRadius: 0, // Remove rounded corners
                mb: 1,
                py: 1.2, // Increase padding for better touch targets
                '&.Mui-selected': {
                  backgroundColor: 'primary.lighter',
                  color: 'primary.main',
                  borderLeft: '3px solid', // Add left border for selected items
                  borderColor: 'primary.main',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                },
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  borderLeft: '3px solid', // Add left border on hover
                  borderColor: 'rgba(74, 20, 140, 0.3)',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <EmojiEvents fontSize="small" color={isActive('/student/results') ? 'primary' : 'inherit'} />
              </ListItemIcon>
              <ListItemText
                primary="Results"
                primaryTypographyProps={{
                  fontSize: '0.9rem',
                  fontWeight: isActive('/student/results') ? 'bold' : 'medium'
                }}
              />
            </ListItemButton>

            <ListItemButton
              component={RouterLink}
              to="/student/history"
              selected={isActive('/student/history')}
              sx={{
                pl: 2,
                borderRadius: 0, // Remove rounded corners
                mb: 1,
                py: 1.2, // Increase padding for better touch targets
                '&.Mui-selected': {
                  backgroundColor: 'primary.lighter',
                  color: 'primary.main',
                  borderLeft: '3px solid', // Add left border for selected items
                  borderColor: 'primary.main',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                },
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  borderLeft: '3px solid', // Add left border on hover
                  borderColor: 'rgba(74, 20, 140, 0.3)',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <History fontSize="small" color={isActive('/student/history') ? 'primary' : 'inherit'} />
              </ListItemIcon>
              <ListItemText
                primary="Exam History"
                primaryTypographyProps={{
                  fontSize: '0.9rem',
                  fontWeight: isActive('/student/history') ? 'bold' : 'medium'
                }}
              />
            </ListItemButton>
          </List>
        </Collapse>

        <Typography
          variant="overline"
          sx={{
            pl: 2,
            opacity: 0.7,
            fontWeight: 'bold',
            letterSpacing: 1,
            display: 'block',
            mt: 3,
            mb: 1
          }}
        >
          ACCOUNT
        </Typography>

        <ListItem disablePadding sx={{ mb: 1 }}>
          <ListItemButton
            component={RouterLink}
            to="/student/profile"
            selected={isActive('/student/profile')}
            sx={{
              borderRadius: 0, // Remove rounded corners
              py: 1.5, // Increase padding for better touch targets
              mb: 0.5, // Add margin between items
              '&.Mui-selected': {
                background: 'linear-gradient(90deg, rgba(74, 20, 140, 0.1) 0%, rgba(74, 20, 140, 0.2) 100%)',
                color: 'primary.main',
                borderLeft: '4px solid', // Add left border for selected items
                borderColor: 'primary.main',
                '&:hover': {
                  background: 'linear-gradient(90deg, rgba(74, 20, 140, 0.15) 0%, rgba(74, 20, 140, 0.25) 100%)',
                },
                '& .MuiListItemIcon-root': {
                  color: 'primary.main',
                },
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              },
              '&:hover': {
                background: 'rgba(0, 0, 0, 0.04)',
                borderLeft: '4px solid', // Add left border on hover
                borderColor: 'rgba(74, 20, 140, 0.3)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            <ListItemIcon>
              <Avatar
                sx={{
                  bgcolor: isActive('/student/profile') ? 'primary.lighter' : 'transparent',
                  color: isActive('/student/profile') ? 'primary.main' : 'action.active',
                  width: 32,
                  height: 32,
                }}
              >
                <Person fontSize="small" />
              </Avatar>
            </ListItemIcon>
            <ListItemText
              primary="Profile"
              primaryTypographyProps={{
                fontWeight: isActive('/student/profile') ? 'bold' : 'medium'
              }}
            />
          </ListItemButton>
        </ListItem>

        <Box sx={{ px: 2, mt: 4, mb: 2 }}>
          <Button
            fullWidth
            variant="contained"
            color="error"
            onClick={handleLogout}
            startIcon={<Logout />}
            sx={{
              py: 1.5, // Increase padding for better touch targets
              borderRadius: 0, // Remove rounded corners
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
              '&:hover': {
                boxShadow: '0 6px 15px rgba(0,0,0,0.15)',
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.2s ease',
            }}
          >
            Logout
          </Button>
        </Box>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
          backgroundColor: 'primary.main',
          color: 'white',
          borderRadius: 0, // Remove rounded corners
          borderBottom: '1px solid rgba(255,255,255,0.1)', // Add subtle border
        }}
      >
        <Toolbar sx={{ py: { xs: 1, md: 1.5 } }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{
              mr: 2,
              display: { md: 'none' },
              bgcolor: 'rgba(255,255,255,0.1)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
            }}
          >
            <MenuIcon />
          </IconButton>

          {/* Page title - can be dynamic based on current route */}
          <Typography
            variant="h6"
            component="h1"
            sx={{
              display: { xs: 'none', sm: 'block' },
              fontWeight: 'bold',
              letterSpacing: '0.5px',
              textShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
          >
            Student Portal
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Notifications">
              <IconButton
                size="large"
                color="inherit"
                onClick={handleNotificationsOpen}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                }}
              >
                <Badge badgeContent={3} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
            </Tooltip>

            <Tooltip title="Help">
              <IconButton
                size="large"
                color="inherit"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                }}
              >
                <Help />
              </IconButton>
            </Tooltip>

            <Tooltip title="Account">
              <IconButton
                size="large"
                edge="end"
                onClick={handleProfileMenuOpen}
                color="inherit"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                }}
              >
                <AccountCircle />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              borderRadius: 0 // Remove rounded corners
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              borderRadius: 0 // Remove rounded corners
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1.5, sm: 2, md: 3 },
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          backgroundColor: 'background.default',
          pt: { xs: 8, md: 10 },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          maxWidth: '100%',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}
      >
        {children}
      </Box>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1.5,
            width: 200,
            borderRadius: 0, // Remove rounded corners
            overflow: 'visible',
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          }
        }}
      >
        <MenuItem component={RouterLink} to="/student/profile" onClick={handleProfileMenuClose}>
          <ListItemIcon>
            <Person fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={handleProfileMenuClose}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" color="error" />
          </ListItemIcon>
          <Typography color="error">Logout</Typography>
        </MenuItem>
      </Menu>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationsAnchorEl}
        open={Boolean(notificationsAnchorEl)}
        onClose={handleNotificationsClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1.5,
            width: 320,
            borderRadius: 0, // Remove rounded corners
            overflow: 'visible',
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          }
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle1" fontWeight="bold">Notifications</Typography>
        </Box>
        <MenuItem onClick={handleNotificationsClose}>
          <Box sx={{ width: '100%' }}>
            <Typography variant="body2" fontWeight="medium">New exam assigned</Typography>
            <Typography variant="caption" color="text.secondary">
              Mathematics 101 exam has been assigned to you
            </Typography>
          </Box>
        </MenuItem>
        <MenuItem onClick={handleNotificationsClose}>
          <Box sx={{ width: '100%' }}>
            <Typography variant="body2" fontWeight="medium">Exam results available</Typography>
            <Typography variant="caption" color="text.secondary">
              Your Physics 202 exam results are now available
            </Typography>
          </Box>
        </MenuItem>
        <MenuItem onClick={handleNotificationsClose}>
          <Box sx={{ width: '100%' }}>
            <Typography variant="body2" fontWeight="medium">Upcoming exam reminder</Typography>
            <Typography variant="caption" color="text.secondary">
              Chemistry 101 exam starts in 2 days
            </Typography>
          </Box>
        </MenuItem>
        <Box sx={{ p: 1, borderTop: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
          <Button size="small" onClick={handleNotificationsClose}>
            View all notifications
          </Button>
        </Box>
      </Menu>
    </Box>
  );
};

export default StudentLayout;
