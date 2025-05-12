import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Grow,
  Fade,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  History,
  CheckCircle,
  Cancel,
  AccessTime,
  Search,
  FilterList,
  Sort,
  Info,
  EmojiEvents,
  Timeline,
  School,
  Visibility
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import api from '../../services/api';
import StudentLayout from './StudentLayout';

// Styled components
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'medium',
  '&.MuiTableCell-head': {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.common.white,
    fontWeight: 'bold',
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:hover': {
    backgroundColor: theme.palette.primary.lighter,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

const ExamHistory = () => {
  const [loading, setLoading] = useState(true);
  const [examHistory, setExamHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    fetchExamHistory();
  }, []);
  
  useEffect(() => {
    filterExamHistory();
  }, [examHistory, tabValue, searchTerm]);
  
  const fetchExamHistory = async () => {
    setLoading(true);
    try {
      // Replace with actual API call when available
      // const response = await api.get('/api/student/exam-history');
      // setExamHistory(response.data);
      
      // Mock data for now
      const mockData = [
        {
          _id: '1',
          examId: {
            _id: 'exam1',
            title: 'Mathematics 101 Final Exam',
            totalPoints: 100
          },
          score: 85,
          status: 'completed',
          startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
          submittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 1.5 * 60 * 60 * 1000).toISOString(),
          correctAnswers: 17,
          totalQuestions: 20
        },
        {
          _id: '2',
          examId: {
            _id: 'exam2',
            title: 'Physics 202 Midterm',
            totalPoints: 50
          },
          score: 42,
          status: 'completed',
          startTime: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000 + 1.5 * 60 * 60 * 1000).toISOString(),
          submittedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000 + 1.2 * 60 * 60 * 1000).toISOString(),
          correctAnswers: 14,
          totalQuestions: 15
        },
        {
          _id: '3',
          examId: {
            _id: 'exam3',
            title: 'Chemistry 101 Quiz',
            totalPoints: 30
          },
          score: 18,
          status: 'completed',
          startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000).toISOString(),
          submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 0.8 * 60 * 60 * 1000).toISOString(),
          correctAnswers: 6,
          totalQuestions: 10
        },
        {
          _id: '4',
          examId: {
            _id: 'exam4',
            title: 'Biology 201 Final',
            totalPoints: 100
          },
          score: 92,
          status: 'completed',
          startTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
          submittedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000 + 2.5 * 60 * 60 * 1000).toISOString(),
          correctAnswers: 46,
          totalQuestions: 50
        },
        {
          _id: '5',
          examId: {
            _id: 'exam5',
            title: 'Computer Science 303 Midterm',
            totalPoints: 80
          },
          score: 72,
          status: 'completed',
          startTime: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
          submittedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000 + 1.8 * 60 * 60 * 1000).toISOString(),
          correctAnswers: 18,
          totalQuestions: 20
        }
      ];
      
      setExamHistory(mockData);
      setError(null);
    } catch (error) {
      console.error('Error fetching exam history:', error);
      setError('Failed to load exam history. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const filterExamHistory = () => {
    let filtered = [...examHistory];
    
    // Apply tab filter
    if (tabValue === 1) { // High scores
      filtered = filtered.filter(exam => {
        const percentage = (exam.score / exam.examId.totalPoints) * 100;
        return percentage >= 80;
      });
    } else if (tabValue === 2) { // Low scores
      filtered = filtered.filter(exam => {
        const percentage = (exam.score / exam.examId.totalPoints) * 100;
        return percentage < 60;
      });
    }
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(exam => 
        exam.examId.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredHistory(filtered);
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const getScoreColor = (score, totalPoints) => {
    const percentage = (score / totalPoints) * 100;
    if (percentage >= 80) return 'success.main';
    if (percentage >= 60) return 'warning.main';
    return 'error.main';
  };
  
  if (loading) {
    return (
      <StudentLayout>
        <Container maxWidth="lg" sx={{ textAlign: 'center', py: 8 }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading exam history...
          </Typography>
        </Container>
      </StudentLayout>
    );
  }
  
  if (error) {
    return (
      <StudentLayout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
          <Button
            variant="contained"
            color="primary"
            onClick={fetchExamHistory}
            startIcon={<Refresh />}
          >
            Try Again
          </Button>
        </Container>
      </StudentLayout>
    );
  }
  
  return (
    <StudentLayout>
      <Container maxWidth="lg" sx={{ mb: 4 }}>
        <Grow in={true} timeout={800}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              mb: 4,
              borderRadius: 4,
              background: 'linear-gradient(135deg, #4a148c 0%, #7c43bd 100%)',
              color: 'white',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <History sx={{ fontSize: 40, mr: 2 }} />
              <Typography variant="h4" component="h1" fontWeight="bold">
                Exam History
              </Typography>
            </Box>
            <Typography variant="subtitle1" sx={{ mt: 1, opacity: 0.9 }}>
              View your past exam performance and track your progress
            </Typography>
          </Paper>
        </Grow>
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Fade in={true} timeout={1000}>
              <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
                  <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    indicatorColor="primary"
                    textColor="primary"
                    sx={{ flexGrow: 1 }}
                  >
                    <Tab label="All Exams" />
                    <Tab label="High Scores" />
                    <Tab label="Low Scores" />
                  </Tabs>
                  
                  <TextField
                    placeholder="Search exams..."
                    size="small"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ width: { xs: '100%', sm: 'auto' } }}
                  />
                </Box>
                
                <Divider />
                
                <TableContainer>
                  <Table sx={{ minWidth: 700 }}>
                    <TableHead>
                      <TableRow>
                        <StyledTableCell>Exam Title</StyledTableCell>
                        <StyledTableCell align="center">Date Taken</StyledTableCell>
                        <StyledTableCell align="center">Score</StyledTableCell>
                        <StyledTableCell align="center">Correct Answers</StyledTableCell>
                        <StyledTableCell align="center">Actions</StyledTableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredHistory.length > 0 ? (
                        filteredHistory.map((exam) => (
                          <StyledTableRow key={exam._id}>
                            <StyledTableCell component="th" scope="row">
                              <Typography variant="body1" fontWeight="medium">
                                {exam.examId.title}
                              </Typography>
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              {formatDate(exam.startTime)}
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              <Typography
                                variant="body1"
                                fontWeight="bold"
                                sx={{ color: getScoreColor(exam.score, exam.examId.totalPoints) }}
                              >
                                {exam.score} / {exam.examId.totalPoints}
                                <Typography component="span" variant="body2" sx={{ ml: 1 }}>
                                  ({Math.round((exam.score / exam.examId.totalPoints) * 100)}%)
                                </Typography>
                              </Typography>
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              {exam.correctAnswers} / {exam.totalQuestions}
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              <Button
                                variant="outlined"
                                size="small"
                                component={RouterLink}
                                to={`/student/results/${exam._id}`}
                                startIcon={<Visibility />}
                              >
                                View Details
                              </Button>
                            </StyledTableCell>
                          </StyledTableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                            <Typography variant="body1" color="text.secondary">
                              No exam history found
                              {searchTerm && ' matching your search criteria'}
                              {tabValue === 1 && ' with high scores'}
                              {tabValue === 2 && ' with low scores'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Fade>
          </Grid>
        </Grid>
      </Container>
    </StudentLayout>
  );
};

export default ExamHistory;
