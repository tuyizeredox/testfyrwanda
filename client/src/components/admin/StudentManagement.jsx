import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Tooltip,
  CircularProgress,
  Alert,
  Snackbar,
  InputAdornment,
  Grow,
  Zoom,
  Fade
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  Refresh,
  PersonAdd,
  CheckCircle,
  Error,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import api from '../../services/api';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Student form
  const [openForm, setOpenForm] = useState(false);
  const [formMode, setFormMode] = useState('add'); // 'add' or 'edit'
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    studentId: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  
  // Delete confirmation
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  
  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Fetch students
  useEffect(() => {
    fetchStudents();
  }, []);
  
  // Filter students based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = students.filter(
        student => 
          student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents(students);
    }
    setPage(0);
  }, [searchTerm, students]);
  
  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await api.get('/api/admin/students');
      setStudents(res.data);
      setFilteredStudents(res.data);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to load students. Please try again later.');
      setLoading(false);
    }
  };
  
  // Form handlers
  const handleOpenForm = (mode, student = null) => {
    setFormMode(mode);
    setSelectedStudent(student);
    
    if (mode === 'edit' && student) {
      setFormData({
        username: student.username,
        password: '',
        fullName: student.fullName,
        email: student.email,
        studentId: student.studentId
      });
    } else {
      setFormData({
        username: '',
        password: '',
        fullName: '',
        email: '',
        studentId: ''
      });
    }
    
    setFormErrors({});
    setOpenForm(true);
  };
  
  const handleCloseForm = () => {
    setOpenForm(false);
  };
  
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    }
    
    if (formMode === 'add' && !formData.password.trim()) {
      errors.password = 'Password is required';
    }
    
    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.studentId.trim()) {
      errors.studentId = 'Student ID is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmitForm = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      if (formMode === 'add') {
        // Add new student
        const res = await api.post('/api/admin/students', formData);
        
        setStudents(prev => [...prev, res.data]);
        
        setSnackbar({
          open: true,
          message: 'Student added successfully',
          severity: 'success'
        });
      } else {
        // Edit existing student
        const dataToUpdate = { ...formData };
        if (!dataToUpdate.password) {
          delete dataToUpdate.password;
        }
        
        const res = await api.put(`/api/admin/students/${selectedStudent._id}`, dataToUpdate);
        
        setStudents(prev => 
          prev.map(student => 
            student._id === selectedStudent._id ? res.data : student
          )
        );
        
        setSnackbar({
          open: true,
          message: 'Student updated successfully',
          severity: 'success'
        });
      }
      
      handleCloseForm();
    } catch (err) {
      console.error('Error saving student:', err);
      
      setSnackbar({
        open: true,
        message: `Failed to ${formMode === 'add' ? 'add' : 'update'} student: ${err.response?.data?.message || 'Unknown error'}`,
        severity: 'error'
      });
    }
  };
  
  // Delete handlers
  const handleOpenDeleteConfirm = (student) => {
    setStudentToDelete(student);
    setOpenDeleteConfirm(true);
  };
  
  const handleCloseDeleteConfirm = () => {
    setOpenDeleteConfirm(false);
    setStudentToDelete(null);
  };
  
  const handleDeleteStudent = async () => {
    try {
      await api.delete(`/api/admin/students/${studentToDelete._id}`);
      
      setStudents(prev => 
        prev.filter(student => student._id !== studentToDelete._id)
      );
      
      setSnackbar({
        open: true,
        message: 'Student deleted successfully',
        severity: 'success'
      });
      
      handleCloseDeleteConfirm();
    } catch (err) {
      console.error('Error deleting student:', err);
      
      setSnackbar({
        open: true,
        message: `Failed to delete student: ${err.response?.data?.message || 'Unknown error'}`,
        severity: 'error'
      });
      
      handleCloseDeleteConfirm();
    }
  };
  
  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Snackbar handler
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h4" component="h1" fontWeight="bold">
              Student Management
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => handleOpenForm('add')}
              startIcon={<PersonAdd />}
              sx={{ color: 'black', fontWeight: 'bold' }}
            >
              Add New Student
            </Button>
          </Box>
        </Paper>
      </Grow>
      
      <Fade in={true} timeout={1000}>
        <Paper elevation={2} sx={{ mb: 4, p: 2, borderRadius: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 30 }
                }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={fetchStudents}
                  sx={{ ml: 1 }}
                >
                  Refresh
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Fade>
      
      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 4 }}
          action={
            <Button color="inherit" size="small" onClick={fetchStudents}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}
      
      {/* Students Table */}
      <Zoom in={true} style={{ transitionDelay: '400ms' }}>
        <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: 'primary.main' }}>
                <TableRow>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Student ID</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Full Name</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Username</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Email</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                      {searchTerm ? 'No students match your search' : 'No students found'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((student) => (
                      <TableRow 
                        key={student._id}
                        sx={{ 
                          '&:hover': { 
                            bgcolor: 'action.hover',
                            transition: 'background-color 0.2s'
                          }
                        }}
                      >
                        <TableCell>
                          <Chip 
                            label={student.studentId} 
                            color="primary" 
                            size="small"
                            sx={{ fontWeight: 'bold' }}
                          />
                        </TableCell>
                        <TableCell>{student.fullName}</TableCell>
                        <TableCell>{student.username}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell align="right">
                          <Tooltip title="Edit Student">
                            <IconButton 
                              color="primary" 
                              onClick={() => handleOpenForm('edit', student)}
                              size="small"
                              sx={{ mr: 1 }}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Student">
                            <IconButton 
                              color="error" 
                              onClick={() => handleOpenDeleteConfirm(student)}
                              size="small"
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredStudents.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </Zoom>
      
      {/* Add/Edit Student Dialog */}
      <Dialog open={openForm} onClose={handleCloseForm} maxWidth="sm" fullWidth>
        <DialogTitle>
          {formMode === 'add' ? 'Add New Student' : 'Edit Student'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleFormChange}
                error={!!formErrors.fullName}
                helperText={formErrors.fullName}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Student ID"
                name="studentId"
                value={formData.studentId}
                onChange={handleFormChange}
                error={!!formErrors.studentId}
                helperText={formErrors.studentId}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleFormChange}
                error={!!formErrors.email}
                helperText={formErrors.email}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleFormChange}
                error={!!formErrors.username}
                helperText={formErrors.username}
                required
                disabled={formMode === 'edit'}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={formMode === 'edit' ? 'New Password (leave blank to keep current)' : 'Password'}
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleFormChange}
                error={!!formErrors.password}
                helperText={formErrors.password}
                required={formMode === 'add'}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseForm} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitForm} 
            variant="contained" 
            color="primary"
            startIcon={formMode === 'add' ? <Add /> : <Edit />}
          >
            {formMode === 'add' ? 'Add Student' : 'Update Student'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteConfirm} onClose={handleCloseDeleteConfirm}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the student <strong>{studentToDelete?.fullName}</strong>? 
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseDeleteConfirm} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteStudent} 
            variant="contained" 
            color="error"
            startIcon={<Delete />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default StudentManagement;
