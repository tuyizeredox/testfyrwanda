import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Pagination,
  useTheme,
  Tooltip
} from '@mui/material';
import {
  Search,
  FilterList,
  Sort,
  AccessTime,
  School,
  Assignment,
  CheckCircle,
  PlayArrow,
  ArrowForward,
  CalendarToday,
  LockOutlined,
  Lock,
  Refresh,
  CheckBox,
  Info
} from '@mui/icons-material';
import StudentLayout from './StudentLayout';
import api from '../../services/api';

const Exams = () => {
  const theme = useTheme();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [page, setPage] = useState(1);
  const examsPerPage = 6;

  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        const response = await api.get('/student/exams');
        console.log('Exams data from API:', response.data);

        // Check if selective answering data is present
        const hasSelectiveAnswering = response.data.some(exam => exam.allowSelectiveAnswering === true);
        console.log('Any exam has selective answering?', hasSelectiveAnswering);

        if (response.data.length > 0) {
          console.log('First exam fields:', Object.keys(response.data[0]));
          console.log('First exam selective answering:', response.data[0].allowSelectiveAnswering);
        }

        setExams(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching exams:', err);
        setError('Failed to load exams. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  // Filter and sort exams
  const filteredExams = exams
    .filter(exam => {
      // Apply search filter
      if (searchTerm && !exam.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Apply status filter
      if (filterStatus !== 'all' && exam.status !== filterStatus) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      // Apply sorting
      if (sortBy === 'date') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      } else if (sortBy === 'duration') {
        return a.timeLimit - b.timeLimit;
      }
      return 0;
    });

  // Pagination
  const totalPages = Math.ceil(filteredExams.length / examsPerPage);
  const displayedExams = filteredExams.slice(
    (page - 1) * examsPerPage,
    page * examsPerPage
  );

  // Function to get status color
  const getStatusColor = (status, isLocked) => {
    if (isLocked) return 'error';

    switch (status) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'warning';
      case 'not-started':
        return 'info';
      default:
        return 'default';
    }
  };

  // Function to get status icon
  const getStatusIcon = (status, isLocked) => {
    if (isLocked) return <Lock />;

    switch (status) {
      case 'completed':
        return <CheckCircle />;
      case 'in-progress':
        return <AccessTime />;
      case 'not-started':
        return <PlayArrow />;
      default:
        return null;
    }
  };

  return (
    <StudentLayout>
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Available Exams
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Browse and take your assigned exams
          </Typography>
        </Box>

        {/* Filters and Search */}
        <Box sx={{ mb: 4, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <TextField
            placeholder="Search exams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flexGrow: 1, minWidth: { xs: '100%', sm: 'auto' } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            size="small"
          />

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="filter-status-label">Status</InputLabel>
            <Select
              labelId="filter-status-label"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              label="Status"
              startAdornment={
                <InputAdornment position="start">
                  <FilterList fontSize="small" />
                </InputAdornment>
              }
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="not-started">Not Started</MenuItem>
              <MenuItem value="in-progress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="locked">Locked</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="sort-by-label">Sort By</InputLabel>
            <Select
              labelId="sort-by-label"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              label="Sort By"
              startAdornment={
                <InputAdornment position="start">
                  <Sort fontSize="small" />
                </InputAdornment>
              }
            >
              <MenuItem value="date">Date (Newest)</MenuItem>
              <MenuItem value="title">Title (A-Z)</MenuItem>
              <MenuItem value="duration">Duration</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Exams Grid */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ my: 4 }}>
            {error}
          </Alert>
        ) : displayedExams.length === 0 ? (
          <Box sx={{ textAlign: 'center', my: 8 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No exams found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your search or filters
            </Typography>
          </Box>
        ) : (
          <>
            <Grid container spacing={3}>
              {displayedExams.map((exam) => (
                <Grid item xs={12} sm={6} md={4} key={exam._id}>
                  <Card
                    elevation={3}
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 0, // Remove rounded corners
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 12px 20px rgba(0, 0, 0, 0.2)',
                      },
                      // Special styling for selective answering exams
                      ...(exam.allowSelectiveAnswering && {
                        border: `2px solid ${theme.palette.secondary.main}`,
                        boxShadow: `0 4px 12px ${theme.palette.secondary.light}`,
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: `0 12px 20px ${theme.palette.secondary.light}`,
                        }
                      }),
                      // Add overlay for locked exams
                      ...(exam.isLocked && {
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          backgroundColor: 'rgba(0, 0, 0, 0.05)',
                          zIndex: 1,
                          pointerEvents: 'none'
                        }
                      })
                    }}
                  >
                    <Box
                      sx={{
                        position: 'relative',
                        height: 140,
                        overflow: 'hidden',
                      }}
                    >
                      <CardMedia
                        component="img"
                        height="140"
                        image={`https://source.unsplash.com/random/300x200/?exam,education,${exam.title.split(' ')[0]}`}
                        alt={exam.title}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          bgcolor: 'rgba(0, 0, 0, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography
                          variant="h6"
                          component="h3"
                          sx={{
                            color: 'white',
                            fontWeight: 'bold',
                            textAlign: 'center',
                            px: 2,
                            textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                          }}
                        >
                          {exam.title}
                        </Typography>
                      </Box>
                      {/* Status Chip */}
                      <Chip
                        icon={getStatusIcon(exam.status, exam.isLocked)}
                        label={exam.isLocked ? 'Locked' : exam.status.replace('-', ' ')}
                        color={getStatusColor(exam.status, exam.isLocked)}
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 10,
                          right: 10,
                          textTransform: 'capitalize',
                          borderRadius: 0, // Remove rounded corners
                          zIndex: 2
                        }}
                      />

                      {/* Selective Answering Indicator */}
                      {exam.allowSelectiveAnswering && (
                        <Chip
                          icon={<CheckBox fontSize="small" />}
                          label="Selective"
                          size="small"
                          color="secondary"
                          sx={{
                            position: 'absolute',
                            top: 10,
                            left: 10,
                            borderRadius: 0,
                            zIndex: 2,
                            fontWeight: 'bold',
                            bgcolor: 'rgba(156, 39, 176, 0.9)',
                            color: 'white',
                            '& .MuiChip-icon': {
                              color: 'white'
                            }
                          }}
                        />
                      )}
                    </Box>

                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      {/* Selective Answering Banner */}
                      {exam.allowSelectiveAnswering && (
                        <Box
                          sx={{
                            mb: 2,
                            p: 1,
                            bgcolor: theme.palette.secondary.light,
                            borderLeft: `4px solid ${theme.palette.secondary.main}`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                          }}
                        >
                          <CheckBox fontSize="small" color="secondary" />
                          <Typography variant="caption" sx={{ fontWeight: 'bold', color: theme.palette.secondary.dark }}>
                            Selective Answering Exam
                          </Typography>
                        </Box>
                      )}

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mb: 2,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          height: '4.5em',
                        }}
                      >
                        {exam.description || 'No description available for this exam.'}
                      </Typography>

                      {/* Debug info - remove in production */}
                      {process.env.NODE_ENV === 'development' && (
                        <Box sx={{ mb: 2, p: 1, bgcolor: '#f5f5f5', fontSize: '10px' }}>
                          <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: '10px' }}>
                            allowSelectiveAnswering: {String(exam.allowSelectiveAnswering)}
                          </Typography>
                        </Box>
                      )}

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                        <Chip
                          icon={<AccessTime fontSize="small" />}
                          label={`${exam.timeLimit} min`}
                          size="small"
                          variant="outlined"
                          color="primary"
                          sx={{ borderRadius: 0 }} // Remove rounded corners
                        />

                        <Chip
                          icon={<CalendarToday fontSize="small" />}
                          label={new Date(exam.scheduledFor || exam.createdAt).toLocaleDateString()}
                          size="small"
                          variant="outlined"
                          sx={{ borderRadius: 0 }} // Remove rounded corners
                        />

                        {/* Selective Answering Badge */}
                        {exam.allowSelectiveAnswering ? (
                          <Tooltip
                            title={
                              <React.Fragment>
                                <Box sx={{
                                  p: 0.5,
                                  bgcolor: theme.palette.secondary.main,
                                  color: 'white',
                                  mb: 1,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1
                                }}>
                                  <CheckBox fontSize="small" />
                                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                    Selective Answering Enabled
                                  </Typography>
                                </Box>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                  In this exam, you can choose which questions to answer in Sections B and C.
                                  Only selected questions will count toward your score.
                                </Typography>
                                <Box sx={{
                                  p: 1,
                                  bgcolor: 'rgba(156, 39, 176, 0.1)',
                                  borderLeft: `3px solid ${theme.palette.secondary.main}`,
                                  mb: 1
                                }}>
                                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                    Required Questions:
                                  </Typography>
                                  <Box component="ul" sx={{ mt: 0.5, pl: 2, mb: 0 }}>
                                    <Box component="li">
                                      <Typography variant="body2">
                                        Section B: Select any {exam.sectionBRequiredQuestions || '?'} questions
                                      </Typography>
                                    </Box>
                                    <Box component="li">
                                      <Typography variant="body2">
                                        Section C: Select any {exam.sectionCRequiredQuestions || '?'} questions
                                      </Typography>
                                    </Box>
                                  </Box>
                                </Box>
                                <Typography variant="caption" sx={{ fontStyle: 'italic', display: 'block', textAlign: 'center' }}>
                                  Click for more details during the exam
                                </Typography>
                              </React.Fragment>
                            }
                            arrow
                            placement="top"
                            componentsProps={{
                              tooltip: {
                                sx: {
                                  bgcolor: 'white',
                                  color: 'text.primary',
                                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                                  maxWidth: 320,
                                  p: 2,
                                  '& .MuiTooltip-arrow': {
                                    color: 'white'
                                  }
                                }
                              }
                            }}
                          >
                            <Chip
                              icon={<CheckBox fontSize="small" />}
                              label="Selective Answering"
                              size="small"
                              variant="filled"
                              color="secondary"
                              sx={{
                                borderRadius: 0,
                                fontWeight: 'bold',
                                cursor: 'help',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                '&:hover': {
                                  boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                                }
                              }}
                            />
                          </Tooltip>
                        ) : (
                          // Debug chip to show when selective answering is false
                          <Chip
                            label="Regular Exam"
                            size="small"
                            variant="outlined"
                            color="default"
                            sx={{
                              borderRadius: 0,
                              display: process.env.NODE_ENV === 'development' ? 'flex' : 'none'
                            }}
                          />
                        )}
                      </Box>
                    </CardContent>

                    <Divider />

                    <CardActions sx={{ p: 2, flexDirection: exam.status === 'completed' && !exam.isLocked ? 'column' : 'row', gap: 1 }}>
                      <Button
                        variant={exam.status === 'in-progress' ? 'contained' : 'outlined'}
                        color={
                          exam.isLocked
                            ? 'error'
                            : exam.status === 'completed'
                              ? 'success'
                              : exam.status === 'in-progress'
                                ? 'warning'
                                : 'primary'
                        }
                        component={exam.isLocked ? undefined : RouterLink}
                        to={!exam.isLocked ? (
                          exam.status === 'completed'
                            ? `/student/results/${exam._id}`
                            : exam.status === 'in-progress'
                              ? `/student/exam/${exam._id}`
                              : `/student/exam/start/${exam._id}`
                        ) : undefined}
                        endIcon={exam.isLocked ? <LockOutlined /> : <ArrowForward />}
                        disabled={exam.isLocked}
                        fullWidth
                        sx={{
                          borderRadius: 0, // Remove rounded corners
                          py: 1,
                          ...(exam.isLocked && {
                            '&.Mui-disabled': {
                              color: 'error.main',
                              borderColor: 'error.main',
                              opacity: 0.7
                            }
                          })
                        }}
                      >
                        {exam.isLocked
                          ? 'Exam Locked'
                          : exam.status === 'in-progress'
                            ? 'Continue Exam'
                            : exam.status === 'completed'
                              ? 'View Results'
                              : 'Start Exam'}
                      </Button>

                      {/* Show Retake button for completed exams that are not locked */}
                      {exam.status === 'completed' && !exam.isLocked && (
                        <Button
                          variant="contained"
                          color="primary"
                          component={RouterLink}
                          to={`/student/exam/start/${exam._id}`}
                          endIcon={<Refresh />}
                          fullWidth
                          sx={{
                            borderRadius: 0, // Remove rounded corners
                            py: 1,
                            mt: 1
                          }}
                        >
                          Retake Exam
                        </Button>
                      )}
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(e, value) => setPage(value)}
                  color="primary"
                  size="large"
                  showFirstButton
                  showLastButton
                />
              </Box>
            )}
          </>
        )}
      </Container>
    </StudentLayout>
  );
};

export default Exams;
