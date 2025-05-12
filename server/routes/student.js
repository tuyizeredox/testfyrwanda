const express = require('express');
const router = express.Router();
const {
  getAvailableExams,
  getStudentResults,
  getDetailedResult,
  getCurrentExamSession
} = require('../controllers/studentController');
const auth = require('../middleware/auth');
const { isStudent } = require('../middleware/role');

// Apply auth and student middleware to all routes
router.use(auth, isStudent);

// Exam routes
router.get('/exams', getAvailableExams);
router.get('/exams/:examId/session', getCurrentExamSession);

// Results routes
router.get('/results', getStudentResults);
router.get('/results/:resultId', getDetailedResult);

module.exports = router;
