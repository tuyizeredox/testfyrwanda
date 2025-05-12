import api from './api';

// Get dashboard statistics
export const getDashboardStats = async () => {
  try {
    // Use real API call
    const response = await api.get('/admin/dashboard-stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

// Get all students
export const getAllStudents = async () => {
  try {
    // Use real API call
    const response = await api.get('/admin/students');
    return response.data;
  } catch (error) {
    console.error('Error fetching students:', error);
    throw error;
  }
};

// Register a new student
export const registerStudent = async (studentData) => {
  try {
    const response = await api.post('/admin/students', studentData);
    return response.data;
  } catch (error) {
    console.error('Error registering student:', error);
    throw error;
  }
};

// Update a student
export const updateStudent = async (id, studentData) => {
  try {
    const response = await api.put(`/admin/students/${id}`, studentData);
    return response.data;
  } catch (error) {
    console.error('Error updating student:', error);
    throw error;
  }
};

// Delete a student
export const deleteStudent = async (id) => {
  try {
    const response = await api.delete(`/admin/students/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting student:', error);
    throw error;
  }
};

// Get all exams
export const getAllExams = async () => {
  try {
    // Use real API call
    const response = await api.get('/admin/exams');
    return response.data;
  } catch (error) {
    console.error('Error fetching exams:', error);
    throw error;
  }
};

// Get scheduled exams
export const getScheduledExams = async () => {
  try {
    // Using the primary endpoint for scheduled exams
    const response = await api.get('/admin/exams/scheduled');
    return response.data;
  } catch (error) {
    console.error('Error fetching scheduled exams:', error);
    throw error;
  }
};

// Toggle exam lock status
export const toggleExamLock = async (id, isLocked) => {
  try {
    const response = await api.put(`/admin/exams/${id}/toggle-lock`, { isLocked });
    return response.data;
  } catch (error) {
    console.error('Error toggling exam lock:', error);
    throw error;
  }
};

// Get exam by ID
export const getExamById = async (id) => {
  try {
    const response = await api.get(`/admin/exams/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Create a new exam
export const createExam = async (examData) => {
  try {
    const response = await api.post('/admin/exams', examData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update an exam
export const updateExam = async (id, examData) => {
  try {
    const response = await api.put(`/admin/exams/${id}`, examData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete an exam
export const deleteExam = async (id) => {
  try {
    console.log(`Deleting exam with ID: ${id}`);
    // Remove the /api prefix since it's already in the baseURL
    const response = await api.delete(`/exam/${id}`);
    console.log('Delete exam response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in deleteExam service:', error);
    throw error;
  }
};

// Schedule an exam
export const scheduleExam = async (scheduleData) => {
  try {
    const response = await api.post('/admin/schedule-exam', scheduleData);
    return response.data;
  } catch (error) {
    console.error('Error scheduling exam:', error);
    throw error;
  }
};

// Get recent exams
export const getRecentExams = async () => {
  try {
    const response = await api.get('/admin/recent-exams');
    return response.data;
  } catch (error) {
    console.error('Error fetching recent exams:', error);
    throw error;
  }
};

// Get recent students
export const getRecentStudents = async () => {
  try {
    const response = await api.get('/admin/recent-students');
    return response.data;
  } catch (error) {
    console.error('Error fetching recent students:', error);
    throw error;
  }
};

// Get security alerts
export const getSecurityAlerts = async () => {
  try {
    const response = await api.get('/admin/security-alerts');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Resolve a security alert
export const resolveSecurityAlert = async (alertId, data) => {
  try {
    const response = await api.put(`/admin/security-alerts/${alertId}/resolve`, data);
    return response.data;
  } catch (error) {
    console.error('Error resolving security alert:', error);
    throw error;
  }
};

// Ignore a security alert
export const ignoreSecurityAlert = async (alertId, data) => {
  try {
    const response = await api.put(`/admin/security-alerts/${alertId}/ignore`, data);
    return response.data;
  } catch (error) {
    console.error('Error ignoring security alert:', error);
    throw error;
  }
};

// Get activity logs
export const getActivityLogs = async () => {
  try {
    const response = await api.get('/admin/activity-logs');
    return response.data;
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    throw error;
  }
};

// Update security settings
export const updateSecuritySettings = async (settings) => {
  try {
    const response = await api.put('/admin/security-settings', settings);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get security settings
export const getSecuritySettings = async () => {
  try {
    const response = await api.get('/admin/security-settings');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// This function was removed to fix duplicate declaration
// The getScheduledExams function is already defined at line 73

// Update a scheduled exam
export const updateScheduledExam = async (examId, scheduleData) => {
  try {
    const response = await api.put(`/admin/exams/${examId}/schedule`, scheduleData);
    return response.data;
  } catch (error) {
    console.error('Error updating scheduled exam:', error);
    throw error;
  }
};
