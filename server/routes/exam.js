const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  createExam,
  getExams,
  getExamById,
  updateExam,
  deleteExam,
  toggleExamLock,
  startExam,
  submitAnswer,
  completeExam,
  gradeManually,
  triggerAIGrading,
  resetExamQuestions,
  debugExamContent,
  getExamResult,
  regradeExamResult,
  regradeAllExams,
  enableSelectiveAnswering,
  selectQuestion,
  fixExistingResults,
  debugResult,
  comprehensiveAIGrading
} = require('../controllers/examController');
const auth = require('../middleware/auth');
const { isAdmin, isStudent } = require('../middleware/role');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');

    // Create the directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log('Created uploads directory:', uploadDir);
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /pdf|doc|docx/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF and Word documents are allowed'));
    }
  }
});

// Apply auth middleware to all routes
router.use(auth);

// Admin routes
router.post(
  '/',
  isAdmin,
  upload.fields([
    { name: 'examFile', maxCount: 1 },
    { name: 'answerFile', maxCount: 1 }
  ]),
  createExam
);
router.put(
  '/:id',
  isAdmin,
  upload.fields([
    { name: 'examFile', maxCount: 1 },
    { name: 'answerFile', maxCount: 1 }
  ]),
  updateExam
);
router.delete('/:id', isAdmin, deleteExam);
router.put('/:id/toggle-lock', isAdmin, toggleExamLock);
router.post('/grade/:resultId', isAdmin, gradeManually);
router.post('/ai-grade/:resultId', isAdmin, triggerAIGrading);
router.get('/:id/debug', isAdmin, debugExamContent);
router.post('/:id/reset-questions', isAdmin, resetExamQuestions);

// Regrading routes
router.post('/regrade/:resultId', auth, regradeExamResult); // Allow both students and admins to request regrading
router.post('/regrade-all', isAdmin, regradeAllExams);
router.post('/fix-results', isAdmin, fixExistingResults); // Fix existing results with incorrect scores
router.get('/debug-result/:resultId', isAdmin, debugResult); // Debug specific result
router.post('/comprehensive-ai-grading', isAdmin, comprehensiveAIGrading); // Comprehensive AI grading
router.post('/:id/enable-selective-answering', isAdmin, enableSelectiveAnswering);

// Routes for both admin and students
router.get('/', getExams);
router.get('/:id', getExamById);

// Student routes
router.post('/:id/start', isStudent, startExam);
router.post('/:id/answer', isStudent, submitAnswer);
router.post('/:id/complete', isStudent, completeExam);
router.post('/:id/select-question', isStudent, selectQuestion); // New route for selective answering
router.get('/result/:id', auth, getExamResult); // Both students and admins can view results

module.exports = router;
