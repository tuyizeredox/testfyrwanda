// Middleware to check if user is an admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Access denied. Admin role required.' });
};

// Middleware to check if user is a student
const isStudent = (req, res, next) => {
  if (req.user && req.user.role === 'student') {
    return next();
  }
  return res.status(403).json({ message: 'Access denied. Student role required.' });
};

// Middleware to check system lock status
const checkSystemLock = async (req, res, next) => {
  try {
    const SystemConfig = require('../models/SystemConfig');
    const config = await SystemConfig.getConfig();
    
    // If system is locked and user is not an admin, only allow exam routes
    if (config.isLocked && req.user.role !== 'admin') {
      // Allow access only to exam-related routes
      const allowedPaths = ['/api/exam', '/api/student/exams'];
      const isAllowedPath = allowedPaths.some(path => req.path.startsWith(path));
      
      if (!isAllowedPath) {
        return res.status(403).json({ 
          message: config.lockMessage || 'The system is currently locked. Only exams are accessible.'
        });
      }
    }
    
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error checking system lock status' });
  }
};

module.exports = {
  isAdmin,
  isStudent,
  checkSystemLock
};
