import { useState, useEffect } from 'react';
import { Box, CssBaseline, useMediaQuery, useTheme, alpha } from '@mui/material';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Dashboard components
import Sidebar from '../components/admin/dashboard/Sidebar.jsx';
import Header from '../components/admin/dashboard/Header.jsx';
import DashboardHome from '../components/admin/dashboard/Home.jsx';

// Exam Management
import ExamList from '../components/admin/exams/ExamList.jsx';
import CreateExam from '../components/admin/exams/CreateExam.jsx';
import ExamScheduler from '../components/admin/exams/ExamScheduler.jsx';
import ScheduledExams from '../components/admin/exams/ScheduledExams.jsx';
import EditScheduledExam from '../components/admin/exams/EditScheduledExam.jsx';
import AIGrading from '../components/admin/exams/AIGrading.jsx';
import RegradeExams from '../components/admin/RegradeExams.jsx';
import ExamTemplates from '../components/admin/exams/ExamTemplates.jsx';
import ViewExam from '../components/admin/exams/ViewExam.jsx';
import EditExam from '../components/admin/exams/EditExam.jsx';
import EnableSelectiveAnswering from '../components/admin/exams/EnableSelectiveAnswering.jsx';

// Student Management
import StudentList from '../components/admin/students/StudentList.jsx';
import AddStudent from '../components/admin/students/AddStudent.jsx';
import ImportStudents from '../components/admin/students/ImportStudents.jsx';
import StudentGroups from '../components/admin/students/StudentGroups.jsx';

// Results & Analytics
import ResultsOverview from '../components/admin/results/ResultsOverview.jsx';
import PerformanceAnalytics from '../components/admin/results/PerformanceAnalytics.jsx';
import ExportData from '../components/admin/results/ExportData.jsx';
import ExamLeaderboard from '../components/admin/results/ExamLeaderboard.jsx';
import LeaderboardPage from './admin/LeaderboardPage.jsx';
import NewLeaderboardPage from './admin/NewLeaderboardPage.jsx';

// Security
import LiveMonitoring from '../components/admin/security/LiveMonitoring.jsx';
import SecurityMonitoring from '../components/admin/security/SecurityMonitoring.jsx';
import ActivityLogs from '../components/admin/security/ActivityLogs.jsx';

// Settings
import ProfileSettings from '../components/admin/settings/ProfileSettings.jsx';
import SystemSettings from '../components/admin/settings/SystemSettings.jsx';
import Appearance from '../components/admin/settings/Appearance.jsx';

const NewAdminDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const location = useLocation();

  // Close sidebar on mobile when navigating
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  // Ensure user is authenticated and is an admin
  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <CssBaseline />

      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={toggleSidebar} />

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          height: '100vh',
          overflow: 'auto',
          bgcolor: alpha(theme.palette.background.default, 0.98),
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          ...(sidebarOpen && {
            marginLeft: { md: '280px' },
            width: { md: 'calc(100% - 280px)' },
            transition: theme.transitions.create(['margin', 'width'], {
              easing: theme.transitions.easing.easeOut,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }),
          position: 'relative',
          zIndex: 1
        }}
      >
        {/* Header */}
        <Header toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />

        {/* Page content */}
        <Box
          sx={{
            p: { xs: 1, sm: 1.5, md: 2, lg: 3 },
            pt: { xs: 1.5, sm: 2, md: 3 },
            mt: { xs: 8, md: 9 },
            minHeight: 'calc(100vh - 70px)',
            borderRadius: { xs: '8px 8px 0 0', md: '16px 16px 0 0' },
            backgroundColor: alpha(theme.palette.background.default, 0.8),
            backdropFilter: 'blur(10px)',
            boxShadow: '0 -10px 30px rgba(0, 0, 0, 0.05)',
            overflowX: 'hidden',
            maxWidth: '100%',
            boxSizing: 'border-box'
          }}
        >
          <Routes>
            {/* Dashboard Home */}
            <Route path="/" element={<DashboardHome />} />

            {/* Exam Management */}
            <Route path="/exams" element={<ExamList />} />
            <Route path="/exams/create" element={<CreateExam />} />
            <Route path="/exams/schedule" element={<ExamScheduler />} />
            <Route path="/exams/scheduled" element={<ScheduledExams />} />
            <Route path="/exams/scheduled/edit/:id" element={<EditScheduledExam />} />
            <Route path="/exams/grading" element={<AIGrading />} />
            <Route path="/exams/regrade" element={<RegradeExams />} />
            <Route path="/exams/templates" element={<ExamTemplates />} />
            <Route path="/exams/:id/view" element={<ViewExam />} />
            <Route path="/exams/:id/edit" element={<EditExam />} />
            <Route path="/exams/:id/enable-selective-answering" element={<EnableSelectiveAnswering />} />

            {/* Student Management */}
            <Route path="/students" element={<StudentList />} />
            <Route path="/students/add" element={<AddStudent />} />
            <Route path="/students/import" element={<ImportStudents />} />
            <Route path="/students/groups" element={<StudentGroups />} />

            {/* Results & Analytics */}
            <Route path="/results" element={<ResultsOverview />} />
            <Route path="/results/analytics" element={<PerformanceAnalytics />} />
            <Route path="/results/export" element={<ExportData />} />
            <Route path="/results/leaderboard" element={<NewLeaderboardPage />} />
            <Route path="/results/old-leaderboard" element={<LeaderboardPage />} />
            <Route path="/exams/:examId/leaderboard" element={<NewLeaderboardPage />} />

            {/* Security */}
            <Route path="/security/monitoring" element={<LiveMonitoring />} />
            <Route path="/security/alerts" element={<SecurityMonitoring />} />
            <Route path="/security/logs" element={<ActivityLogs />} />

            {/* Settings */}
            <Route path="/settings/profile" element={<ProfileSettings />} />
            <Route path="/settings/system" element={<SystemSettings />} />
            <Route path="/settings/appearance" element={<Appearance />} />

            {/* Default redirect */}
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </Box>
      </Box>
    </Box>
  );
};

export default NewAdminDashboard;
