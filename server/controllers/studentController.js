const Exam = require('../models/Exam');
const Result = require('../models/Result');
const User = require('../models/User');

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

// @desc    Get class leaderboard
// @route   GET /api/student/leaderboard
// @access  Private/Student
const getClassLeaderboard = async (req, res) => {
  try {
    // Get the current student's class
    const currentStudent = await User.findById(req.user._id).select('class organization');

    if (!currentStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // If student doesn't have a class assigned, return an empty leaderboard
    if (!currentStudent.class) {
      return res.json({
        leaderboard: [],
        message: 'No class assigned to this student'
      });
    }

    // Find all students in the same class
    const classmates = await User.find({
      role: 'student',
      class: currentStudent.class,
      organization: currentStudent.organization
    }).select('_id firstName lastName');

    if (!classmates || classmates.length === 0) {
      return res.json({
        leaderboard: [],
        message: 'No other students found in your class'
      });
    }

    // Get all completed results for these students
    const classmateIds = classmates.map(student => student._id);

    // Get all completed results
    const results = await Result.find({
      student: { $in: classmateIds },
      isCompleted: true
    })
      .populate({
        path: 'student',
        select: 'firstName lastName email class organization',
        options: { virtuals: true }
      })
      .populate('exam', 'title maxPossibleScore')
      .select('totalScore maxPossibleScore startTime endTime exam');

    // Group results by student
    const studentResults = {};

    results.forEach(result => {
      const studentId = result.student._id.toString();

      if (!studentResults[studentId]) {
        studentResults[studentId] = {
          id: studentId,
          name: `${result.student.firstName} ${result.student.lastName}`,
          studentClass: result.student.class,
          organization: result.student.organization,
          totalScore: 0,
          totalPossible: 0,
          examCount: 0,
          isCurrentUser: studentId === req.user._id.toString()
        };
      }

      // Add this result's score to the student's total
      studentResults[studentId].totalScore += result.totalScore || 0;
      studentResults[studentId].totalPossible += result.maxPossibleScore || 0;
      studentResults[studentId].examCount += 1;
    });

    // Convert to array and calculate percentages
    const leaderboard = Object.values(studentResults).map(student => {
      const percentage = student.totalPossible > 0
        ? Math.round((student.totalScore / student.totalPossible) * 100)
        : 0;

      return {
        ...student,
        percentage,
        score: student.totalScore // For compatibility with the frontend
      };
    });

    // Sort by percentage (highest first)
    leaderboard.sort((a, b) => b.percentage - a.percentage);

    // Add rank property
    leaderboard.forEach((student, index) => {
      student.rank = index + 1;
    });

    res.json({
      leaderboard,
      classInfo: {
        name: currentStudent.class,
        organization: currentStudent.organization
      }
    });
  } catch (error) {
    console.error('Get class leaderboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAvailableExams,
  getStudentResults,
  getDetailedResult,
  getCurrentExamSession,
  getClassLeaderboard
};
