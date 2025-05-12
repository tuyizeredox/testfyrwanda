const Exam = require('../models/Exam');
const Result = require('../models/Result');

// @desc    Get available exams for student
// @route   GET /api/student/exams
// @access  Private/Student
const getAvailableExams = async (req, res) => {
  try {
    // Get all exams assigned to this student (including locked ones)
    const exams = await Exam.find({
      assignedTo: req.user._id
    })
      .populate('createdBy', 'firstName lastName')
      .select('title description timeLimit isLocked scheduledFor startTime endTime createdAt allowSelectiveAnswering sectionBRequiredQuestions sectionCRequiredQuestions');

    // Log selective answering status for debugging
    if (exams.length > 0) {
      console.log(`First exam selective answering status: ${exams[0].allowSelectiveAnswering}`);
    }

    // Get results for this student
    const results = await Result.find({
      student: req.user._id
    }).select('exam isCompleted');

    // Map results to exam IDs
    const completedExams = results
      .filter(result => result.isCompleted)
      .map(result => result.exam.toString());

    const inProgressExams = results
      .filter(result => !result.isCompleted)
      .map(result => result.exam.toString());

    // Current time for availability check
    const now = new Date();

    // Fetch exams again to get the updated data after enabling selective answering
    const updatedExams = await Exam.find({
      assignedTo: req.user._id
    })
      .populate('createdBy', 'firstName lastName')
      .select('title description timeLimit isLocked scheduledFor startTime endTime createdAt allowSelectiveAnswering sectionBRequiredQuestions sectionCRequiredQuestions');

    // Add status to each exam
    const examsWithStatus = updatedExams.map(exam => {
      const examObj = exam.toObject();

      // Add completion status
      if (completedExams.includes(exam._id.toString())) {
        examObj.status = 'completed';
      } else if (inProgressExams.includes(exam._id.toString())) {
        examObj.status = 'in-progress';
      } else {
        examObj.status = 'not-started';
      }

      // Add availability status
      if (exam.isLocked) {
        examObj.availability = 'locked';
      } else if (exam.startTime && exam.endTime) {
        if (now < exam.startTime) {
          examObj.availability = 'upcoming';
        } else if (now >= exam.startTime && now <= exam.endTime) {
          examObj.availability = 'available';
        } else {
          examObj.availability = 'expired';
        }
      } else {
        examObj.availability = 'unknown';
      }

      // Log selective answering info for debugging
      console.log(`Exam ${exam._id} - allowSelectiveAnswering: ${exam.allowSelectiveAnswering}, sectionB: ${exam.sectionBRequiredQuestions}, sectionC: ${exam.sectionCRequiredQuestions}`);

      return examObj;
    });

    // Log the first exam's fields for debugging
    if (examsWithStatus.length > 0) {
      console.log('First exam fields:', Object.keys(examsWithStatus[0]));
      console.log('First exam selective answering:', examsWithStatus[0].allowSelectiveAnswering);
    }

    res.json(examsWithStatus);
  } catch (error) {
    console.error('Get available exams error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get student's exam results
// @route   GET /api/student/results
// @access  Private/Student
const getStudentResults = async (req, res) => {
  try {
    const results = await Result.find({
      student: req.user._id,
      isCompleted: true
    })
      .populate('exam', 'title description timeLimit')
      .select('-answers');

    res.json(results);
  } catch (error) {
    console.error('Get student results error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get detailed result for a specific exam
// @route   GET /api/student/results/:resultId
// @access  Private/Student
const getDetailedResult = async (req, res) => {
  try {
    console.log(`Fetching detailed result for ID: ${req.params.resultId}, student: ${req.user._id}`);

    // Validate the resultId
    if (!req.params.resultId || !req.params.resultId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid result ID format' });
    }

    const result = await Result.findOne({
      _id: req.params.resultId,
      student: req.user._id,
      isCompleted: true
    }).populate({
      path: 'answers.question',
      select: 'text type options correctAnswer points section'
    }).populate('exam', 'title description timeLimit');

    if (!result) {
      console.log(`Result not found for ID: ${req.params.resultId}, student: ${req.user._id}`);
      return res.status(404).json({ message: 'Result not found or not completed yet' });
    }

    // Check if all questions are properly populated
    const hasInvalidQuestions = result.answers.some(answer => !answer.question);
    if (hasInvalidQuestions) {
      console.log('Some questions could not be populated, they may have been deleted');

      // Filter out answers with missing questions
      result.answers = result.answers.filter(answer => answer.question);

      // Recalculate total score if needed
      if (result.answers.length > 0) {
        result.totalScore = result.answers.reduce((total, answer) => total + (answer.score || 0), 0);
      }
    }

    console.log(`Successfully retrieved result with ${result.answers.length} answers`);
    res.json(result);
  } catch (error) {
    console.error('Get detailed result error:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get current exam session
// @route   GET /api/student/exams/:examId/session
// @access  Private/Student
const getCurrentExamSession = async (req, res) => {
  try {
    const result = await Result.findOne({
      student: req.user._id,
      exam: req.params.examId,
      isCompleted: false
    }).populate({
      path: 'answers.question',
      select: 'text type options points section'
    }).populate('exam', 'title description timeLimit');

    if (!result) {
      return res.status(404).json({ message: 'No active exam session found' });
    }

    // Calculate time remaining
    const startTime = new Date(result.startTime).getTime();
    const currentTime = Date.now();
    const timeLimit = result.exam.timeLimit * 60 * 1000; // Convert minutes to milliseconds
    const timeElapsed = currentTime - startTime;
    const timeRemaining = Math.max(0, timeLimit - timeElapsed);

    res.json({
      ...result.toObject(),
      timeRemaining
    });
  } catch (error) {
    console.error('Get current exam session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAvailableExams,
  getStudentResults,
  getDetailedResult,
  getCurrentExamSession
};
