const mongoose = require('mongoose');
const User = require('../models/User');
const SystemConfig = require('../models/SystemConfig');
const Exam = require('../models/Exam');
const Result = require('../models/Result');
const SecurityAlert = require('../models/SecurityAlert');
const ActivityLog = require('../models/ActivityLog');

// Simple in-memory cache for leaderboard data (5 minute TTL)
const leaderboardCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getCacheKey = (adminId, examId = 'all') => `leaderboard_${adminId}_${examId}`;

const getCachedData = (key) => {
  const cached = leaderboardCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
};

const setCachedData = (key, data) => {
  leaderboardCache.set(key, {
    data,
    timestamp: Date.now()
  });
};

// Clean up expired cache entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of leaderboardCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      leaderboardCache.delete(key);
    }
  }
}, 10 * 60 * 1000);

// @desc    Register a new student
// @route   POST /api/admin/students
// @access  Private/Admin
const registerStudent = async (req, res) => {
  try {
    console.log('Register student request body:', req.body);
    const { firstName, lastName, email, password, class: studentClass, organization } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if student already exists
    const studentExists = await User.findOne({ email });

    if (studentExists) {
      return res.status(400).json({ message: 'Student with this email already exists' });
    }

    // Create student
    const student = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: 'student',
      class: studentClass || '',
      organization: organization || '',
      createdBy: req.user._id // Set the admin who created this student
    });

    console.log('Student created successfully:', student._id);

    if (student) {
      // Log the activity
      await ActivityLog.logActivity({
        user: req.user._id,
        action: 'add_student',
        details: {
          studentId: student._id,
          studentName: `${student.firstName} ${student.lastName}`,
          studentEmail: student.email
        }
      });

      res.status(201).json({
        _id: student._id,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        role: student.role,
        class: student.class,
        organization: student.organization
      });
    } else {
      res.status(400).json({ message: 'Invalid student data' });
    }
  } catch (error) {
    console.error('Register student error:', error);
    console.error('Error details:', error.message);

    // Handle duplicate key error (MongoDB error code 11000)
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Student with this email already exists' });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }

    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// @desc    Get all students created by this admin
// @route   GET /api/admin/students
// @access  Private/Admin
const getStudents = async (req, res) => {
  try {
    // Find students created by this admin
    const students = await User.find({
      role: 'student',
      createdBy: req.user._id // Only return students created by this admin
    }).select('-password');

    res.json(students);
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get student by ID
// @route   GET /api/admin/students/:id
// @access  Private/Admin
const getStudentById = async (req, res) => {
  try {
    const student = await User.findById(req.params.id).select('-password');

    // Check if student exists, is a student, and was created by this admin
    if (student && student.role === 'student' &&
        (student.createdBy && student.createdBy.toString() === req.user._id.toString())) {
      res.json(student);
    } else {
      res.status(404).json({ message: 'Student not found or not authorized to access this student' });
    }
  } catch (error) {
    console.error('Get student by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update student
// @route   PUT /api/admin/students/:id
// @access  Private/Admin
const updateStudent = async (req, res) => {
  try {
    const { firstName, lastName, email, class: studentClass, organization, isBlocked } = req.body;

    const student = await User.findById(req.params.id);

    // Check if student exists, is a student, and was created by this admin
    if (student && student.role === 'student' &&
        (student.createdBy && student.createdBy.toString() === req.user._id.toString())) {
      // Update student fields
      if (firstName) student.firstName = firstName;
      if (lastName) student.lastName = lastName;
      if (email) student.email = email;
      if (studentClass) student.class = studentClass;
      if (organization) student.organization = organization;
      if (isBlocked !== undefined) student.isBlocked = isBlocked;

      const updatedStudent = await student.save();

      // Log the activity
      await ActivityLog.logActivity({
        user: req.user._id,
        action: 'edit_student',
        details: {
          studentId: updatedStudent._id,
          studentName: `${updatedStudent.firstName} ${updatedStudent.lastName}`
        }
      });

      res.json({
        _id: updatedStudent._id,
        firstName: updatedStudent.firstName,
        lastName: updatedStudent.lastName,
        email: updatedStudent.email,
        role: updatedStudent.role,
        class: updatedStudent.class,
        organization: updatedStudent.organization,
        isBlocked: updatedStudent.isBlocked
      });
    } else {
      res.status(404).json({ message: 'Student not found' });
    }
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete student
// @route   DELETE /api/admin/students/:id
// @access  Private/Admin
const deleteStudent = async (req, res) => {
  try {
    const student = await User.findById(req.params.id);

    // Check if student exists, is a student, and was created by this admin
    if (student && student.role === 'student' &&
        (student.createdBy && student.createdBy.toString() === req.user._id.toString())) {
      const studentName = `${student.firstName} ${student.lastName}`;
      await student.deleteOne();

      // Log the activity
      await ActivityLog.logActivity({
        user: req.user._id,
        action: 'delete_student',
        details: {
          studentId: req.params.id,
          studentName: studentName
        }
      });

      res.json({ message: 'Student removed successfully' });
    } else {
      res.status(404).json({ message: 'Student not found' });
    }
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Lock/unlock system
// @route   PUT /api/admin/system-lock
// @access  Private/Admin
const toggleSystemLock = async (req, res) => {
  try {
    const { isLocked, lockMessage } = req.body;

    const config = await SystemConfig.getConfig();

    config.isLocked = isLocked !== undefined ? isLocked : config.isLocked;
    config.lockMessage = lockMessage || config.lockMessage;
    config.updatedBy = req.user._id;
    config.updatedAt = Date.now();

    await config.save();

    // Log the activity
    await ActivityLog.logActivity({
      user: req.user._id,
      action: config.isLocked ? 'system_lock' : 'system_unlock',
      details: {
        lockMessage: config.lockMessage
      }
    });

    res.json(config);
  } catch (error) {
    console.error('Toggle system lock error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get system lock status
// @route   GET /api/admin/system-lock
// @access  Private/Admin
const getSystemLockStatus = async (req, res) => {
  try {
    const config = await SystemConfig.getConfig();
    res.json(config);
  } catch (error) {
    console.error('Get system lock status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get exam results
// @route   GET /api/admin/exams/:examId/results
// @access  Private/Admin
const getExamResults = async (req, res) => {
  try {
    const { examId } = req.params;

    // Check if exam exists and belongs to this admin
    const exam = await Exam.findOne({
      _id: examId,
      createdBy: req.user._id
    });

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found or not authorized' });
    }

    // Get students created by this admin
    const students = await User.find({
      role: 'student',
      createdBy: req.user._id
    }).select('_id');

    const studentIds = students.map(student => student._id);

    // Get results for this exam from students created by this admin
    const results = await Result.find({
      exam: examId,
      student: { $in: studentIds }
    })
      .populate('student', 'fullName firstName lastName studentId email organization studentClass')
      .populate('exam', 'title')
      .sort({ totalScore: -1, endTime: -1 });

    // Format results with additional calculated fields
    const formattedResults = results.map(result => {
      const percentage = result.maxPossibleScore > 0
        ? Math.round((result.totalScore / result.maxPossibleScore) * 100)
        : 0;

      // Calculate time taken
      const timeTaken = result.endTime && result.startTime
        ? Math.round((new Date(result.endTime) - new Date(result.startTime)) / (1000 * 60))
        : 0;

      return {
        _id: result._id,
        student: {
          _id: result.student._id,
          fullName: result.student.fullName ||
                   `${result.student.firstName || ''} ${result.student.lastName || ''}`.trim(),
          firstName: result.student.firstName,
          lastName: result.student.lastName,
          studentId: result.student.studentId,
          email: result.student.email,
          organization: result.student.organization,
          studentClass: result.student.studentClass
        },
        exam: result.exam,
        totalScore: result.totalScore || 0,
        maxPossibleScore: result.maxPossibleScore || 0,
        percentage,
        timeTaken,
        startTime: result.startTime,
        endTime: result.endTime,
        isCompleted: result.isCompleted,
        aiGradingStatus: result.aiGradingStatus
      };
    });

    res.json(formattedResults);
  } catch (error) {
    console.error('Get exam results error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get overall leaderboard for students created by this admin
// @route   GET /api/admin/leaderboard
// @access  Private/Admin
const getOverallLeaderboard = async (req, res) => {
  try {
    console.log(`Admin ${req.user._id} requesting overall leaderboard`);
    const startTime = Date.now();

    // Check cache first
    const cacheKey = getCacheKey(req.user._id, 'all');
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      console.log(`Returning cached overall leaderboard for admin ${req.user._id}`);
      return res.json(cachedData);
    }

    // Get students created by this admin with lean query for better performance
    const students = await User.find({
      role: 'student',
      createdBy: req.user._id
    }).select('_id').lean();

    const studentIds = students.map(student => student._id);
    console.log(`Found ${studentIds.length} students for admin`);

    // Get exams created by this admin with lean query
    const exams = await Exam.find({ createdBy: req.user._id }).select('_id').lean();
    const examIds = exams.map(exam => exam._id);
    console.log(`Found ${examIds.length} exams for admin`);

    // Get all completed results for students created by this admin taking exams created by this admin
    const results = await Result.find({
      isCompleted: true,
      student: { $in: studentIds },
      exam: { $in: examIds }
    })
      .populate({
        path: 'student',
        select: 'firstName lastName email organization class',
        options: { virtuals: true }
      })
      .populate('exam', 'title maxPossibleScore')
      .select('totalScore maxPossibleScore startTime endTime exam');

    // Group results by student
    const studentResults = {};

    results.forEach(result => {
      if (!result.student) return;

      const studentId = result.student._id.toString();

      if (!studentResults[studentId]) {
        studentResults[studentId] = {
          id: studentId,
          name: `${result.student.firstName || ''} ${result.student.lastName || ''}`.trim(),
          firstName: result.student.firstName || '',
          lastName: result.student.lastName || '',
          email: result.student.email || '',
          organization: result.student.organization || '',
          studentClass: result.student.class || '',
          exams: [],
          totalScore: 0,
          totalMaxScore: 0,
          totalTimeTaken: 0,
          examCount: 0
        };
      }

      // Calculate percentage score
      const percentage = result.maxPossibleScore > 0
        ? Math.round((result.totalScore / result.maxPossibleScore) * 100)
        : 0;

      // Calculate time taken in minutes
      const startTime = new Date(result.startTime);
      const endTime = new Date(result.endTime || startTime);
      const timeTakenMs = endTime - startTime;
      const timeTakenMinutes = Math.round(timeTakenMs / (1000 * 60));

      // Add exam result
      studentResults[studentId].exams.push({
        examId: result.exam._id,
        examTitle: result.exam.title,
        score: result.totalScore,
        maxScore: result.maxPossibleScore,
        percentage,
        timeTaken: timeTakenMinutes,
        completedAt: result.endTime
      });

      // Update totals
      studentResults[studentId].totalScore += result.totalScore;
      studentResults[studentId].totalMaxScore += result.maxPossibleScore;
      studentResults[studentId].totalTimeTaken += timeTakenMinutes;
      studentResults[studentId].examCount += 1;
    });

    // Convert to array and calculate overall percentage
    const leaderboardData = Object.values(studentResults).map(student => {
      const overallPercentage = student.totalMaxScore > 0
        ? Math.round((student.totalScore / student.totalMaxScore) * 100)
        : 0;

      const avgTimeTaken = student.examCount > 0
        ? Math.round(student.totalTimeTaken / student.examCount)
        : 0;

      return {
        ...student,
        percentage: overallPercentage,
        timeTaken: avgTimeTaken,
        // Add a unique identifier for each student in the overall leaderboard
        uniqueId: `overall-${student.id}`
      };
    });

    // Sort by percentage score (highest first), then by time taken (shortest first)
    leaderboardData.sort((a, b) => {
      if (b.percentage !== a.percentage) {
        return b.percentage - a.percentage;
      }
      return a.timeTaken - b.timeTaken;
    });

    // Limit to top 50 for better performance
    const limitedData = leaderboardData.slice(0, 50);

    const endTime = Date.now();
    console.log(`Overall leaderboard generated in ${endTime - startTime}ms with ${limitedData.length} students`);

    const responseData = {
      examTitle: "All Exams",
      leaderboard: limitedData
    };

    // Cache the response
    setCachedData(cacheKey, responseData);

    res.json(responseData);
  } catch (error) {
    console.error('Get overall leaderboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get exam leaderboard
// @route   GET /api/admin/exams/:examId/leaderboard
// @access  Private/Admin
const getExamLeaderboard = async (req, res) => {
  try {
    const { examId } = req.params;
    console.log(`Admin ${req.user._id} requesting leaderboard for exam ${examId}`);
    const startTime = Date.now();

    // Check cache first
    const cacheKey = getCacheKey(req.user._id, examId);
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      console.log(`Returning cached exam leaderboard for admin ${req.user._id}, exam ${examId}`);
      return res.json(cachedData);
    }

    // Check if exam exists and belongs to this admin
    const exam = await Exam.findOne({
      _id: examId,
      createdBy: req.user._id
    }).lean();

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found or access denied' });
    }

    // Get students created by this admin
    const students = await User.find({
      role: 'student',
      createdBy: req.user._id
    }).select('_id').lean();

    const studentIds = students.map(student => student._id);

    // Get completed results for this exam from admin's students only
    const results = await Result.find({
      exam: examId,
      isCompleted: true,
      student: { $in: studentIds }
    })
      .populate({
        path: 'student',
        select: 'firstName lastName email organization class',
        options: { virtuals: true }
      })
      .populate('exam', 'title maxPossibleScore')
      .select('totalScore maxPossibleScore startTime endTime')
      .limit(100); // Limit for performance

    // Format the results for the leaderboard
    const leaderboardData = results.map(result => {
      // Ensure student data exists
      if (!result.student) {
        console.error('Missing student data for result:', result._id);
        return null;
      }

      // Calculate percentage score
      const percentage = result.maxPossibleScore > 0
        ? Math.round((result.totalScore / result.maxPossibleScore) * 100)
        : 0;

      // Calculate time taken in minutes
      const startTime = new Date(result.startTime);
      const endTime = new Date(result.endTime || startTime); // Use startTime as fallback
      const timeTakenMs = endTime - startTime;
      const timeTakenMinutes = Math.round(timeTakenMs / (1000 * 60));

      // Create fullName from firstName and lastName if not available
      const fullName = `${result.student.firstName || ''} ${result.student.lastName || ''}`.trim();

      return {
        id: result.student._id,
        resultId: result._id, // Ensure this is included for unique keys
        name: fullName,
        firstName: result.student.firstName || '',
        lastName: result.student.lastName || '',
        email: result.student.email || '',
        organization: result.student.organization || '',
        studentClass: result.student.class || '', // Use class field from User model
        score: result.totalScore || 0,
        maxScore: result.maxPossibleScore || 0,
        percentage,
        timeTaken: timeTakenMinutes,
        completedAt: result.endTime,
        startTime: result.startTime,
        examId: result.exam._id,
        // Add a unique identifier combining student ID and result ID
        uniqueId: `${result.student._id}-${result._id}`
      };
    }).filter(Boolean); // Remove any null entries

    // Sort by percentage score (highest first), then by time taken (shortest first)
    leaderboardData.sort((a, b) => {
      if (b.percentage !== a.percentage) {
        return b.percentage - a.percentage;
      }
      return a.timeTaken - b.timeTaken;
    });

    const endTime = Date.now();
    console.log(`Exam leaderboard for ${examId} generated in ${endTime - startTime}ms with ${leaderboardData.length} students`);

    const responseData = {
      examTitle: exam.title,
      leaderboard: leaderboardData
    };

    // Cache the response
    setCachedData(cacheKey, responseData);

    res.json(responseData);
  } catch (error) {
    console.error('Get exam leaderboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get detailed result for a student
// @route   GET /api/admin/results/:resultId
// @access  Private/Admin
const getDetailedResult = async (req, res) => {
  try {
    const { resultId } = req.params;

    const result = await Result.findById(resultId)
      .populate('student', 'fullName firstName lastName studentId email organization studentClass')
      .populate('exam', 'title description totalPoints timeLimit')
      .populate({
        path: 'answers.question',
        select: 'text type options correctAnswer points section'
      });

    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }

    // Check if this result belongs to an exam created by this admin
    const exam = await Exam.findById(result.exam._id);

    if (!exam || exam.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this result' });
    }

    // Calculate additional statistics
    const percentage = result.maxPossibleScore > 0
      ? Math.round((result.totalScore / result.maxPossibleScore) * 100)
      : 0;

    const timeTaken = result.endTime && result.startTime
      ? Math.round((new Date(result.endTime) - new Date(result.startTime)) / (1000 * 60))
      : 0;

    // Analyze answers by section and type
    const answerAnalysis = {
      bySection: {},
      byType: {},
      correctAnswers: 0,
      totalAnswers: result.answers.length
    };

    result.answers.forEach(answer => {
      const section = answer.question.section || 'Unknown';
      const type = answer.question.type || 'Unknown';

      // Initialize section if not exists
      if (!answerAnalysis.bySection[section]) {
        answerAnalysis.bySection[section] = {
          total: 0,
          correct: 0,
          score: 0,
          maxScore: 0
        };
      }

      // Initialize type if not exists
      if (!answerAnalysis.byType[type]) {
        answerAnalysis.byType[type] = {
          total: 0,
          correct: 0,
          score: 0,
          maxScore: 0
        };
      }

      // Update counts
      answerAnalysis.bySection[section].total++;
      answerAnalysis.byType[type].total++;
      answerAnalysis.bySection[section].score += answer.score || 0;
      answerAnalysis.byType[type].score += answer.score || 0;
      answerAnalysis.bySection[section].maxScore += answer.question.points || 0;
      answerAnalysis.byType[type].maxScore += answer.question.points || 0;

      if (answer.isCorrect) {
        answerAnalysis.bySection[section].correct++;
        answerAnalysis.byType[type].correct++;
        answerAnalysis.correctAnswers++;
      }
    });

    // Format the response with enhanced data
    const enhancedResult = {
      ...result.toObject(),
      percentage,
      timeTaken,
      grade: percentage >= 90 ? 'A' : percentage >= 80 ? 'B' : percentage >= 70 ? 'C' : percentage >= 60 ? 'D' : 'F',
      analysis: answerAnalysis,
      performance: {
        excellent: percentage >= 90,
        good: percentage >= 70 && percentage < 90,
        average: percentage >= 50 && percentage < 70,
        poor: percentage < 50
      }
    };

    res.json(enhancedResult);
  } catch (error) {
    console.error('Get detailed result error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Export exam results as CSV
// @route   GET /api/admin/exams/:examId/results/export
// @access  Private/Admin
const exportExamResults = async (req, res) => {
  try {
    const { examId } = req.params;

    // Check if exam exists
    const exam = await Exam.findById(examId);

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Get all results for this exam
    const results = await Result.find({ exam: examId })
      .populate('student', 'fullName studentId email')
      .populate('exam', 'title');

    // Create CSV header
    let csv = 'Student ID,Full Name,Email,Start Time,End Time,Total Score,Max Score,Percentage\n';

    // Add data rows
    results.forEach(result => {
      const percentage = ((result.totalScore / result.maxPossibleScore) * 100).toFixed(2);

      csv += `${result.student.studentId},${result.student.fullName},${result.student.email},`;
      csv += `${result.startTime},${result.endTime || ''},${result.totalScore},`;
      csv += `${result.maxPossibleScore},${percentage}%\n`;
    });

    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=exam-results-${examId}.csv`);

    res.send(csv);
  } catch (error) {
    console.error('Export exam results error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get dashboard statistics for this admin
// @route   GET /api/admin/dashboard-stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    // Get count of students created by this admin
    const studentCount = await User.countDocuments({
      role: 'student',
      createdBy: req.user._id
    });

    // Get count of exams created by this admin
    const examCount = await Exam.countDocuments({ createdBy: req.user._id });

    // Get count of upcoming exams created by this admin (scheduled in the future)
    const upcomingExams = await Exam.countDocuments({
      scheduledFor: { $gt: new Date() },
      status: 'scheduled',
      createdBy: req.user._id
    });

    // Get count of active exams created by this admin (not locked)
    const activeExams = await Exam.countDocuments({
      isLocked: false,
      createdBy: req.user._id
    });

    // Get students created by this admin
    const students = await User.find({
      role: 'student',
      createdBy: req.user._id
    }).select('_id');

    const studentIds = students.map(student => student._id);

    // Get exams created by this admin
    const exams = await Exam.find({ createdBy: req.user._id }).select('_id');
    const examIds = exams.map(exam => exam._id);

    // Get results for students created by this admin taking exams created by this admin
    const results = await Result.find({
      isCompleted: true,
      student: { $in: studentIds },
      exam: { $in: examIds }
    });

    // Calculate performance stats for students created by this admin
    const totalResults = results.length;
    const averageScore = totalResults > 0
      ? Math.round(results.reduce((sum, result) => {
          const percentage = result.maxPossibleScore > 0
            ? (result.totalScore / result.maxPossibleScore) * 100
            : 0;
          return sum + percentage;
        }, 0) / totalResults)
      : 0;

    // Count performance levels
    const excellentCount = results.filter(r => {
      const percentage = r.maxPossibleScore > 0 ? (r.totalScore / r.maxPossibleScore) * 100 : 0;
      return percentage >= 90;
    }).length;

    const goodCount = results.filter(r => {
      const percentage = r.maxPossibleScore > 0 ? (r.totalScore / r.maxPossibleScore) * 100 : 0;
      return percentage >= 70 && percentage < 90;
    }).length;

    const averageCount = results.filter(r => {
      const percentage = r.maxPossibleScore > 0 ? (r.totalScore / r.maxPossibleScore) * 100 : 0;
      return percentage >= 50 && percentage < 70;
    }).length;

    const poorCount = results.filter(r => {
      const percentage = r.maxPossibleScore > 0 ? (r.totalScore / r.maxPossibleScore) * 100 : 0;
      return percentage < 50;
    }).length;

    // Get count of unresolved security alerts
    const securityAlerts = await SecurityAlert.countDocuments({ status: 'unresolved' });

    // Get recent activities from the ActivityLog
    const activities = await ActivityLog.find({})
      .populate('user', 'firstName lastName')
      .sort({ timestamp: -1 })
      .limit(10);

    // Format the activities for display
    const recentActivities = activities.map(activity => activity.formatForDisplay());

    // Return dashboard stats
    res.json({
      totalStudents: studentCount,
      totalExams: examCount,
      activeExams,
      upcomingExams,
      totalResults,
      averageScore,
      performanceBreakdown: {
        excellent: excellentCount,
        good: goodCount,
        average: averageCount,
        poor: poorCount
      },
      securityAlerts,
      recentActivities
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get exam by ID
// @route   GET /api/admin/exams/:id
// @access  Private/Admin
const getExamById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the exam by ID
    const exam = await Exam.findById(id)
      .populate('createdBy', 'firstName lastName');

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Return the exam with all fields
    res.json({
      _id: exam._id,
      title: exam.title,
      description: exam.description,
      timeLimit: exam.timeLimit,
      passingScore: exam.passingScore,
      isLocked: exam.isLocked,
      scheduledFor: exam.scheduledFor,
      startTime: exam.startTime,
      endTime: exam.endTime,
      status: exam.status,
      createdBy: exam.createdBy ?
        `${exam.createdBy.firstName} ${exam.createdBy.lastName}` : 'Unknown',
      assignedTo: exam.assignedTo || [],
      allowLateSubmission: exam.allowLateSubmission || false,
      originalFile: exam.originalFile,
      answerFile: exam.answerFile,
      createdAt: exam.createdAt,
      updatedAt: exam.updatedAt
    });
  } catch (error) {
    console.error('Get exam by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all exams created by this admin
// @route   GET /api/admin/exams
// @access  Private/Admin
const getAllExams = async (req, res) => {
  try {
    // Get all exams created by this admin with populated creator
    const exams = await Exam.find({ createdBy: req.user._id })
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    // Count students for each exam
    const examsWithStudentCount = await Promise.all(
      exams.map(async (exam) => {
        const studentCount = await Result.countDocuments({ exam: exam._id });

        // Calculate completion rate
        const completedCount = await Result.countDocuments({
          exam: exam._id,
          isCompleted: true
        });

        const completionRate = studentCount > 0
          ? Math.round((completedCount / studentCount) * 100)
          : 0;

        return {
          _id: exam._id,
          title: exam.title,
          description: exam.description,
          timeLimit: exam.timeLimit,
          totalPoints: exam.totalPoints,
          isLocked: exam.isLocked,
          createdAt: exam.createdAt,
          scheduledFor: exam.scheduledFor,
          status: exam.status,
          createdBy: `${exam.createdBy.firstName} ${exam.createdBy.lastName}`,
          students: studentCount,
          completionRate,
          assignedTo: exam.assignedTo || []
        };
      })
    );

    res.json(examsWithStudentCount);
  } catch (error) {
    console.error('Get all exams error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all scheduled exams created by this admin
// @route   GET /api/admin/scheduled-exams
// @access  Private/Admin
const getScheduledExams = async (req, res) => {
  try {
    // Get all scheduled exams created by this admin (with scheduledFor date in the future)
    const scheduledExams = await Exam.find({
      scheduledFor: { $ne: null },
      status: 'scheduled',
      createdBy: req.user._id
    })
      .populate('createdBy', 'firstName lastName')
      .sort({ scheduledFor: 1 });

    // Format exams with additional data
    const formattedExams = scheduledExams.map((exam) => {
      return {
        _id: exam._id,
        title: exam.title,
        description: exam.description,
        timeLimit: exam.timeLimit,
        totalPoints: exam.totalPoints,
        scheduledFor: exam.scheduledFor,
        startTime: exam.startTime,
        endTime: exam.endTime,
        status: exam.status,
        createdBy: `${exam.createdBy.firstName} ${exam.createdBy.lastName}`,
        assignedTo: exam.assignedTo || [],
        allowLateSubmission: exam.allowLateSubmission || false,
        isLocked: exam.isLocked
      };
    });

    res.json(formattedExams);
  } catch (error) {
    console.error('Get scheduled exams error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get recent exams created by this admin
// @route   GET /api/admin/recent-exams
// @access  Private/Admin
const getRecentExams = async (req, res) => {
  try {
    // Get 5 most recent exams created by this admin
    const recentExams = await Exam.find({ createdBy: req.user._id })
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(5);

    // Format exams with additional data
    const formattedExams = await Promise.all(
      recentExams.map(async (exam) => {
        const studentCount = await Result.countDocuments({ exam: exam._id });
        const completedCount = await Result.countDocuments({
          exam: exam._id,
          isCompleted: true
        });

        const completionRate = studentCount > 0
          ? Math.round((completedCount / studentCount) * 100)
          : 0;

        // Format date for display
        const examDate = new Date(exam.scheduledFor || exam.createdAt);
        const formattedDate = examDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });

        const formattedTime = examDate.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        });

        // Determine status
        let status = 'scheduled';
        if (exam.isLocked === false && exam.scheduledFor && new Date(exam.scheduledFor) <= new Date()) {
          status = 'active';
        } else if (completionRate === 100) {
          status = 'completed';
        }

        return {
          id: exam._id,
          title: exam.title,
          date: formattedDate,
          time: formattedTime,
          students: studentCount,
          status,
          completionRate
        };
      })
    );

    res.json(formattedExams);
  } catch (error) {
    console.error('Get recent exams error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get recent students created by this admin
// @route   GET /api/admin/recent-students
// @access  Private/Admin
const getRecentStudents = async (req, res) => {
  try {
    // Get 5 most recently registered students created by this admin
    const recentStudents = await User.find({
      role: 'student',
      createdBy: req.user._id
    })
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(5);

    // Format students with additional data
    const formattedStudents = recentStudents.map(student => {
      // Format date for display
      const registeredDate = new Date(student.createdAt);
      const formattedDate = registeredDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });

      return {
        id: student._id,
        name: `${student.firstName} ${student.lastName}`,
        email: student.email,
        registeredDate: formattedDate,
        avatar: null, // Could be added in the future
        performance: Math.floor(Math.random() * 25) + 75 // Mock performance data
      };
    });

    res.json(formattedStudents);
  } catch (error) {
    console.error('Get recent students error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get security alerts
// @route   GET /api/admin/security-alerts
// @access  Private/Admin
const getSecurityAlerts = async (req, res) => {
  try {
    // Get all security alerts with populated student data
    const alerts = await SecurityAlert.find({})
      .populate('student', 'firstName lastName email class organization')
      .populate('exam', 'title')
      .sort({ timestamp: -1 });

    res.json(alerts);
  } catch (error) {
    console.error('Get security alerts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Resolve a security alert
// @route   PUT /api/admin/security-alerts/:id/resolve
// @access  Private/Admin
const resolveSecurityAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const alert = await SecurityAlert.findById(id);

    if (!alert) {
      return res.status(404).json({ message: 'Security alert not found' });
    }

    if (alert.status === 'resolved') {
      return res.status(400).json({ message: 'Alert is already resolved' });
    }

    // Resolve the alert
    await alert.resolve(req.user._id, notes);

    // Populate student data for the response
    const resolvedAlert = await SecurityAlert.findById(id)
      .populate('student', 'firstName lastName email')
      .populate('resolvedBy', 'firstName lastName');

    // Log the activity
    await ActivityLog.logActivity({
      user: req.user._id,
      action: 'resolve_alert',
      details: {
        alertId: alert._id,
        alertType: alert.type,
        studentId: alert.student,
        studentName: `${resolvedAlert.student.firstName} ${resolvedAlert.student.lastName}`
      }
    });

    res.json(resolvedAlert);
  } catch (error) {
    console.error('Resolve security alert error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Ignore a security alert
// @route   PUT /api/admin/security-alerts/:id/ignore
// @access  Private/Admin
const ignoreSecurityAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const alert = await SecurityAlert.findById(id);

    if (!alert) {
      return res.status(404).json({ message: 'Security alert not found' });
    }

    if (alert.status !== 'unresolved') {
      return res.status(400).json({ message: 'Alert is already processed' });
    }

    // Ignore the alert
    await alert.ignore(req.user._id, notes);

    // Populate student data for the response
    const ignoredAlert = await SecurityAlert.findById(id)
      .populate('student', 'firstName lastName email')
      .populate('resolvedBy', 'firstName lastName');

    // Log the activity
    await ActivityLog.logActivity({
      user: req.user._id,
      action: 'ignore_alert',
      details: {
        alertId: alert._id,
        alertType: alert.type,
        studentId: alert.student
      }
    });

    res.json(ignoredAlert);
  } catch (error) {
    console.error('Ignore security alert error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Toggle exam lock status
// @route   PUT /api/admin/exams/:id/toggle-lock
// @access  Private/Admin
const toggleExamLock = async (req, res) => {
  try {
    const { id } = req.params;
    const { isLocked } = req.body;

    console.log(`Toggling exam lock for exam ${id} to ${isLocked}`);

    const exam = await Exam.findById(id);

    if (!exam) {
      console.log(`Exam not found with ID: ${id}`);
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Update exam lock status
    exam.isLocked = isLocked;
    await exam.save();

    console.log(`Exam ${exam.title} (${exam._id}) lock status updated to: ${exam.isLocked}`);

    // Log the activity
    await ActivityLog.logActivity({
      user: req.user._id,
      action: isLocked ? 'lock_exam' : 'unlock_exam',
      details: {
        examId: exam._id,
        examTitle: exam.title
      }
    });

    res.json({
      _id: exam._id,
      title: exam.title,
      isLocked: exam.isLocked,
      message: `Exam ${isLocked ? 'locked' : 'unlocked'} successfully`
    });
  } catch (error) {
    console.error('Toggle exam lock error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get recent activity logs
// @route   GET /api/admin/activity-logs
// @access  Private/Admin
const getActivityLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find({})
      .populate('user', 'firstName lastName email')
      .sort({ timestamp: -1 })
      .limit(50);

    res.json(logs);
  } catch (error) {
    console.error('Get activity logs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a new exam
// @route   POST /api/admin/exams
// @access  Private/Admin
const createExam = async (req, res) => {
  try {
    console.log('Create exam request received:', req.body);
    console.log('Files received:', req.files);

    const { title, description, timeLimit, isLocked, passingScore } = req.body;

    // Validate required fields
    if (!title || !description || !timeLimit) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Initialize file variables
    let examFilePath = null;
    let answerFilePath = null;

    // Check if files are uploaded
    if (req.files) {
      if (req.files.examFile) {
        const examFile = req.files.examFile[0];
        examFilePath = examFile.path;
        console.log('Exam file uploaded:', examFilePath);
      }

      if (req.files.answerFile) {
        const answerFile = req.files.answerFile[0];
        answerFilePath = answerFile.path;
        console.log('Answer file uploaded:', answerFilePath);
      }
    }

    // Convert isLocked to boolean if it's a string
    const isLockedBool = isLocked === 'true' || isLocked === true;

    console.log('Creating exam with data:', {
      title,
      description,
      timeLimit: Number(timeLimit),
      passingScore: Number(passingScore) || 70,
      originalFile: examFilePath ? 'Yes' : 'No',
      answerFile: answerFilePath ? 'Yes' : 'No',
      isLocked: isLockedBool
    });

    // Create exam
    const exam = await Exam.create({
      title,
      description,
      timeLimit: Number(timeLimit),
      passingScore: Number(passingScore) || 70,
      originalFile: examFilePath,
      answerFile: answerFilePath,
      isLocked: isLockedBool,
      createdBy: req.user._id,
      status: 'draft'
    });

    // Log activity
    await ActivityLog.logActivity({
      user: req.user._id,
      action: 'create_exam',
      details: {
        examId: exam._id,
        examTitle: exam.title
      }
    });

    // Parse the exam file to extract questions if it exists
    if (examFilePath) {
      try {
        const { parseFile } = require('../utils/fileParser');
        console.log('Attempting to parse exam file:', examFilePath);

        const parsedExam = await parseFile(examFilePath);
        console.log('Exam file parsed successfully');

        // Create default sections if they don't exist
        if (!exam.sections || exam.sections.length === 0) {
          exam.sections = [
            { name: 'A', description: 'Multiple Choice Questions', questions: [] },
            { name: 'B', description: 'Short Answer Questions', questions: [] },
            { name: 'C', description: 'Long Answer Questions', questions: [] }
          ];
          await exam.save();
          console.log('Created default sections for exam');
        }

        // Create questions for each section
        if (parsedExam && parsedExam.sections) {
          const Question = require('../models/Question');

          for (const section of parsedExam.sections) {
            if (section.questions && section.questions.length > 0) {
              // Find or create the section in the exam
              let examSection = exam.sections.find(s => s.name === section.name);
              if (!examSection) {
                exam.sections.push({
                  name: section.name,
                  description: section.description || `Section ${section.name}`,
                  questions: []
                });
                await exam.save();
                examSection = exam.sections.find(s => s.name === section.name);
                console.log(`Created new section ${section.name} for exam`);
              }

              for (const questionData of section.questions) {
                try {
                  // Validate question data before creating
                  let questionType = questionData.type || 'multiple-choice';

                  // Ensure type is valid
                  if (!['multiple-choice', 'open-ended'].includes(questionType)) {
                    console.warn(`Invalid question type: ${questionType}, defaulting to multiple-choice`);
                    questionType = 'multiple-choice';
                  }

                  // Ensure options are properly formatted for multiple-choice questions
                  let options = [];
                  if (questionType === 'multiple-choice') {
                    if (Array.isArray(questionData.options)) {
                      // Check if options are already in the correct format
                      if (questionData.options.length > 0 && typeof questionData.options[0] === 'object' && 'text' in questionData.options[0]) {
                        options = questionData.options;
                      } else {
                        // Convert simple string array to proper format
                        options = questionData.options.map(opt => ({
                          text: opt,
                          isCorrect: opt === questionData.correctAnswer
                        }));
                      }
                    } else {
                      // Default options if none provided
                      options = [
                        { text: 'Option A', isCorrect: true },
                        { text: 'Option B', isCorrect: false },
                        { text: 'Option C', isCorrect: false },
                        { text: 'Option D', isCorrect: false }
                      ];
                    }
                  }

                  // Ensure correctAnswer is provided
                  const correctAnswer = questionData.correctAnswer ||
                    (questionType === 'multiple-choice' ? 'Option A' : 'Sample answer');

                  // Create the question with validated data
                  const question = await Question.create({
                    text: questionData.text || 'Sample question',
                    type: questionType,
                    options: options,
                    correctAnswer: correctAnswer,
                    points: questionData.points || 1,
                    exam: exam._id,
                    section: section.name
                  });

                  // Add question to the appropriate section
                  const sectionIndex = exam.sections.findIndex(s => s.name === section.name);
                  if (sectionIndex !== -1) {
                    exam.sections[sectionIndex].questions.push(question._id);
                  }

                  console.log('Created question:', question._id, 'for section', section.name);
                } catch (questionError) {
                  console.error('Error creating question:', questionError);
                  // Continue with next question instead of failing the whole process
                }
              }
            }
          }

          // Save the exam with all questions
          await exam.save();
          console.log('Questions extracted and created successfully');
        }
      } catch (parseError) {
        console.error('Error parsing exam file:', parseError);
        // Don't delete the exam, just log the error
        console.log('Continuing without parsing questions');
      }
    }

    res.status(201).json(exam);
  } catch (error) {
    console.error('Create exam error:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }

    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Schedule an exam
// @route   POST /api/admin/schedule-exam
// @access  Private/Admin
const scheduleExam = async (req, res) => {
  try {
    const {
      examId,
      studentIds,
      date,
      startTime,
      endTime,
      sendNotification,
      allowLateSubmission
    } = req.body;

    // Validate required fields
    if (!examId || !date || !startTime || !endTime) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if exam exists
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Parse dates from ISO strings
    console.log('Received date data:', { date, startTime, endTime });

    let scheduledDate, startDateTime, endDateTime;

    try {
      // Parse the date
      scheduledDate = new Date(date);

      // Parse start and end times
      startDateTime = new Date(startTime);
      endDateTime = new Date(endTime);

      // Validate dates
      if (isNaN(scheduledDate.getTime())) {
        return res.status(400).json({ message: 'Invalid date format' });
      }

      if (isNaN(startDateTime.getTime())) {
        return res.status(400).json({ message: 'Invalid start time format' });
      }

      if (isNaN(endDateTime.getTime())) {
        return res.status(400).json({ message: 'Invalid end time format' });
      }

      console.log('Parsed dates:', {
        scheduledDate: scheduledDate.toISOString(),
        startDateTime: startDateTime.toISOString(),
        endDateTime: endDateTime.toISOString()
      });
    } catch (error) {
      console.error('Error parsing dates:', error);
      return res.status(400).json({ message: 'Error parsing date/time values' });
    }

    // Update exam with scheduling information
    exam.scheduledFor = scheduledDate;
    exam.startTime = startDateTime;
    exam.endTime = endDateTime;
    exam.status = 'scheduled';
    exam.allowLateSubmission = allowLateSubmission || false;

    // If studentIds are provided, assign the exam to those students
    if (studentIds && studentIds.length > 0) {
      // Ensure studentIds is an array
      const studentIdsArray = Array.isArray(studentIds) ? studentIds : [studentIds];
      console.log('Processing student IDs:', studentIdsArray);

      // Convert string IDs to ObjectIds if needed
      const validStudentIds = studentIdsArray.filter(id => {
        try {
          if (!id) {
            console.warn('Null or undefined student ID found');
            return false;
          }

          // Convert to string if it's an object with _id property
          const idStr = typeof id === 'object' && id._id ? id._id.toString() : id.toString();
          return mongoose.Types.ObjectId.isValid(idStr);
        } catch (err) {
          console.error('Invalid student ID:', id, err);
          return false;
        }
      });

      // If we already have assignedTo, merge the arrays and remove duplicates
      if (exam.assignedTo && exam.assignedTo.length > 0) {
        // Convert existing IDs to strings for comparison
        const existingIds = exam.assignedTo.map(id => id.toString());

        // Add only new IDs that don't already exist
        const newIds = validStudentIds.filter(id => !existingIds.includes(id.toString()));

        // Combine existing and new IDs
        const newObjectIds = newIds.map(id => {
          const idStr = typeof id === 'object' && id._id ? id._id.toString() : id.toString();
          return new mongoose.Types.ObjectId(idStr);
        });
        exam.assignedTo = [...exam.assignedTo, ...newObjectIds];
      } else {
        // Just set the new IDs
        exam.assignedTo = validStudentIds.map(id => {
          const idStr = typeof id === 'object' && id._id ? id._id.toString() : id.toString();
          return new mongoose.Types.ObjectId(idStr);
        });
      }

      console.log(`Assigned exam to ${exam.assignedTo.length} students`);
    }

    await exam.save();

    console.log('Exam scheduled successfully:', {
      _id: exam._id,
      title: exam.title,
      scheduledFor: exam.scheduledFor,
      startTime: exam.startTime,
      endTime: exam.endTime,
      assignedTo: exam.assignedTo?.length || 0
    });

    // Log activity
    try {
      await ActivityLog.logActivity({
        user: req.user._id,
        action: 'schedule_exam',
        details: {
          examId: exam._id,
          examTitle: exam.title,
          scheduledFor: scheduledDate
        }
      });
    } catch (logError) {
      // Just log the error but don't fail the request
      console.error('Error logging exam scheduling activity:', logError);
    }

    // Send notifications to students if requested
    if (sendNotification && studentIds && studentIds.length > 0) {
      // In a real app, this would send emails or push notifications
      console.log(`Notifications would be sent to ${studentIds.length} students`);
    }

    res.status(200).json({
      message: 'Exam scheduled successfully',
      exam: {
        _id: exam._id,
        title: exam.title,
        scheduledFor: exam.scheduledFor,
        startTime: exam.startTime,
        endTime: exam.endTime,
        status: exam.status,
        assignedTo: exam.assignedTo || []
      }
    });
  } catch (error) {
    console.error('Schedule exam error:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }

    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a scheduled exam
// @route   PUT /api/admin/exams/:id/schedule
// @access  Private/Admin
const updateScheduledExam = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      studentIds,
      date,
      startTime,
      endTime,
      sendNotification,
      allowLateSubmission
    } = req.body;

    // Validate required fields
    if (!date || !startTime || !endTime) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if exam exists
    const exam = await Exam.findById(id);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Parse dates from ISO strings
    console.log('Received date data for update:', { date, startTime, endTime });

    let scheduledDate, startDateTime, endDateTime;

    try {
      // Parse the date
      scheduledDate = new Date(date);

      // Parse start and end times
      startDateTime = new Date(startTime);
      endDateTime = new Date(endTime);

      // Validate dates
      if (isNaN(scheduledDate.getTime())) {
        return res.status(400).json({ message: 'Invalid date format' });
      }

      if (isNaN(startDateTime.getTime())) {
        return res.status(400).json({ message: 'Invalid start time format' });
      }

      if (isNaN(endDateTime.getTime())) {
        return res.status(400).json({ message: 'Invalid end time format' });
      }

      console.log('Parsed dates for update:', {
        scheduledDate: scheduledDate.toISOString(),
        startDateTime: startDateTime.toISOString(),
        endDateTime: endDateTime.toISOString()
      });
    } catch (error) {
      console.error('Error parsing dates:', error);
      return res.status(400).json({ message: 'Error parsing date/time values' });
    }

    // Update exam with scheduling information
    exam.scheduledFor = scheduledDate;
    exam.startTime = startDateTime;
    exam.endTime = endDateTime;
    exam.allowLateSubmission = allowLateSubmission || false;

    // If studentIds are provided, update the assigned students
    if (studentIds && studentIds.length > 0) {
      // Ensure studentIds is an array
      const studentIdsArray = Array.isArray(studentIds) ? studentIds : [studentIds];
      console.log('Processing student IDs for update:', studentIdsArray);

      // Convert string IDs to ObjectIds if needed
      const validStudentIds = studentIdsArray.filter(id => {
        try {
          if (!id) {
            console.warn('Null or undefined student ID found');
            return false;
          }

          // Convert to string if it's an object with _id property
          const idStr = typeof id === 'object' && id._id ? id._id.toString() : id.toString();
          return mongoose.Types.ObjectId.isValid(idStr);
        } catch (err) {
          console.error('Invalid student ID:', id, err);
          return false;
        }
      });

      // Set the new student IDs
      exam.assignedTo = validStudentIds.map(id => {
        const idStr = typeof id === 'object' && id._id ? id._id.toString() : id.toString();
        return new mongoose.Types.ObjectId(idStr);
      });

      console.log(`Updated exam with ${exam.assignedTo.length} students`);
    }

    await exam.save();

    console.log('Exam schedule updated successfully:', {
      _id: exam._id,
      title: exam.title,
      scheduledFor: exam.scheduledFor,
      startTime: exam.startTime,
      endTime: exam.endTime,
      assignedTo: exam.assignedTo?.length || 0
    });

    // Log activity
    try {
      await ActivityLog.logActivity({
        user: req.user._id,
        action: 'update_exam_schedule',
        details: {
          examId: exam._id,
          examTitle: exam.title,
          scheduledFor: scheduledDate
        }
      });
    } catch (logError) {
      // Just log the error but don't fail the request
      console.error('Error logging exam schedule update activity:', logError);
    }

    // Send notifications to students if requested
    if (sendNotification && studentIds && studentIds.length > 0) {
      // In a real app, this would send emails or push notifications
      console.log(`Notifications would be sent to ${studentIds.length} students about schedule changes`);
    }

    res.status(200).json({
      message: 'Exam schedule updated successfully',
      exam: {
        _id: exam._id,
        title: exam.title,
        scheduledFor: exam.scheduledFor,
        startTime: exam.startTime,
        endTime: exam.endTime,
        status: exam.status,
        assignedTo: exam.assignedTo || []
      }
    });
  } catch (error) {
    console.error('Update scheduled exam error:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }

    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all exam results for exams created by this admin
// @route   GET /api/admin/results
// @access  Private/Admin
const getAllResults = async (req, res) => {
  try {
    // Get students created by this admin
    const students = await User.find({
      role: 'student',
      createdBy: req.user._id
    }).select('_id');

    const studentIds = students.map(student => student._id);

    // Get all exams created by this admin
    const exams = await Exam.find({ createdBy: req.user._id }).select('_id');
    const examIds = exams.map(exam => exam._id);

    // Get all results for students created by this admin taking exams created by this admin
    const results = await Result.find({
      isCompleted: true,
      student: { $in: studentIds },
      exam: { $in: examIds }
    })
      .populate('student', 'firstName lastName fullName email organization studentClass studentId')
      .populate('exam', 'title totalPoints')
      .sort({ endTime: -1 });

    // Format the results with enhanced data
    const formattedResults = results.map(result => {
      const percentage = result.maxPossibleScore > 0
        ? Math.round((result.totalScore / result.maxPossibleScore) * 100)
        : 0;

      // Calculate time taken in minutes
      const timeTaken = result.endTime && result.startTime
        ? Math.round((new Date(result.endTime) - new Date(result.startTime)) / (1000 * 60))
        : 0;

      // Determine grade based on percentage
      let grade = 'F';
      if (percentage >= 90) grade = 'A';
      else if (percentage >= 80) grade = 'B';
      else if (percentage >= 70) grade = 'C';
      else if (percentage >= 60) grade = 'D';

      return {
        _id: result._id,
        student: {
          _id: result.student?._id || null,
          fullName: result.student?.fullName ||
                   (result.student ? `${result.student.firstName || ''} ${result.student.lastName || ''}`.trim() : 'Unknown'),
          firstName: result.student?.firstName || '',
          lastName: result.student?.lastName || '',
          email: result.student?.email || 'Unknown',
          studentId: result.student?.studentId || '',
          organization: result.student?.organization || '',
          studentClass: result.student?.studentClass || ''
        },
        exam: {
          _id: result.exam?._id || null,
          title: result.exam?.title || 'Unknown',
          totalPoints: result.exam?.totalPoints || result.maxPossibleScore
        },
        totalScore: result.totalScore || 0,
        maxPossibleScore: result.maxPossibleScore || 0,
        percentage,
        grade,
        timeTaken,
        startTime: result.startTime,
        endTime: result.endTime,
        isCompleted: result.isCompleted,
        aiGradingStatus: result.aiGradingStatus || 'completed'
      };
    });

    // Add summary statistics
    const summary = {
      totalResults: formattedResults.length,
      averageScore: formattedResults.length > 0
        ? Math.round(formattedResults.reduce((sum, result) => sum + result.percentage, 0) / formattedResults.length)
        : 0,
      excellentCount: formattedResults.filter(r => r.percentage >= 90).length,
      goodCount: formattedResults.filter(r => r.percentage >= 70 && r.percentage < 90).length,
      averageCount: formattedResults.filter(r => r.percentage >= 50 && r.percentage < 70).length,
      poorCount: formattedResults.filter(r => r.percentage < 50).length
    };

    res.json({
      results: formattedResults,
      summary
    });
  } catch (error) {
    console.error('Get all results error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get student performance analytics for admin dashboard
// @route   GET /api/admin/analytics/student-performance
// @access  Private/Admin
const getStudentPerformanceAnalytics = async (req, res) => {
  try {
    // Get students created by this admin
    const students = await User.find({
      role: 'student',
      createdBy: req.user._id
    }).select('_id firstName lastName fullName email organization studentClass');

    const studentIds = students.map(student => student._id);

    // Get exams created by this admin
    const exams = await Exam.find({ createdBy: req.user._id }).select('_id title');
    const examIds = exams.map(exam => exam._id);

    // Get all results for students created by this admin taking exams created by this admin
    const results = await Result.find({
      isCompleted: true,
      student: { $in: studentIds },
      exam: { $in: examIds }
    })
      .populate('student', 'firstName lastName fullName email organization studentClass')
      .populate('exam', 'title')
      .sort({ endTime: -1 });

    // Calculate student performance metrics
    const studentPerformance = {};

    results.forEach(result => {
      const studentId = result.student._id.toString();

      if (!studentPerformance[studentId]) {
        studentPerformance[studentId] = {
          student: result.student,
          exams: [],
          totalScore: 0,
          totalMaxScore: 0,
          examCount: 0,
          averageScore: 0,
          bestScore: 0,
          worstScore: 100,
          improvementTrend: 0
        };
      }

      const percentage = result.maxPossibleScore > 0
        ? Math.round((result.totalScore / result.maxPossibleScore) * 100)
        : 0;

      const timeTaken = result.endTime && result.startTime
        ? Math.round((new Date(result.endTime) - new Date(result.startTime)) / (1000 * 60))
        : 0;

      studentPerformance[studentId].exams.push({
        examId: result.exam._id,
        examTitle: result.exam.title,
        score: result.totalScore,
        maxScore: result.maxPossibleScore,
        percentage,
        timeTaken,
        completedAt: result.endTime
      });

      studentPerformance[studentId].totalScore += result.totalScore;
      studentPerformance[studentId].totalMaxScore += result.maxPossibleScore;
      studentPerformance[studentId].examCount++;
      studentPerformance[studentId].bestScore = Math.max(studentPerformance[studentId].bestScore, percentage);
      studentPerformance[studentId].worstScore = Math.min(studentPerformance[studentId].worstScore, percentage);
    });

    // Calculate final metrics and trends
    const performanceArray = Object.values(studentPerformance).map(student => {
      student.averageScore = student.totalMaxScore > 0
        ? Math.round((student.totalScore / student.totalMaxScore) * 100)
        : 0;

      // Calculate improvement trend (compare first 3 and last 3 exams)
      if (student.exams.length >= 3) {
        const sortedExams = student.exams.sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt));
        const firstThree = sortedExams.slice(0, 3);
        const lastThree = sortedExams.slice(-3);

        const firstAvg = firstThree.reduce((sum, exam) => sum + exam.percentage, 0) / firstThree.length;
        const lastAvg = lastThree.reduce((sum, exam) => sum + exam.percentage, 0) / lastThree.length;

        student.improvementTrend = Math.round(lastAvg - firstAvg);
      }

      return {
        id: student.student._id,
        name: student.student.fullName ||
              `${student.student.firstName || ''} ${student.student.lastName || ''}`.trim(),
        email: student.student.email,
        organization: student.student.organization,
        studentClass: student.student.studentClass,
        exams: student.examCount,
        avgScore: student.averageScore,
        bestScore: student.bestScore,
        worstScore: student.worstScore === 100 ? 0 : student.worstScore,
        trend: student.improvementTrend,
        lastExam: student.exams.length > 0
          ? student.exams.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))[0].completedAt
          : null,
        performance: student.averageScore >= 90 ? 'excellent' :
                    student.averageScore >= 70 ? 'good' :
                    student.averageScore >= 50 ? 'average' : 'poor'
      };
    });

    // Sort by average score descending
    performanceArray.sort((a, b) => b.avgScore - a.avgScore);

    // Calculate overall statistics
    const overallStats = {
      totalStudents: performanceArray.length,
      studentsWithExams: performanceArray.filter(s => s.exams > 0).length,
      averageClassScore: performanceArray.length > 0
        ? Math.round(performanceArray.reduce((sum, s) => sum + s.avgScore, 0) / performanceArray.length)
        : 0,
      excellentStudents: performanceArray.filter(s => s.performance === 'excellent').length,
      goodStudents: performanceArray.filter(s => s.performance === 'good').length,
      averageStudents: performanceArray.filter(s => s.performance === 'average').length,
      poorStudents: performanceArray.filter(s => s.performance === 'poor').length,
      improvingStudents: performanceArray.filter(s => s.trend > 0).length,
      decliningStudents: performanceArray.filter(s => s.trend < 0).length
    };

    res.json({
      students: performanceArray,
      stats: overallStats
    });
  } catch (error) {
    console.error('Get student performance analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Debug admin data to troubleshoot issues
// @route   GET /api/admin/debug
// @access  Private/Admin
const debugAdminData = async (req, res) => {
  try {
    const adminId = req.user._id;

    // Get admin info
    const admin = await User.findById(adminId).select('firstName lastName email role');

    // Get exams created by this admin
    const exams = await Exam.find({ createdBy: adminId })
      .select('title createdAt isLocked')
      .sort({ createdAt: -1 });

    // Get students created by this admin
    const studentsCreatedByAdmin = await User.find({
      role: 'student',
      createdBy: adminId
    }).select('firstName lastName email createdAt');

    // Get all students who have taken exams created by this admin
    const examIds = exams.map(exam => exam._id);
    const allResults = await Result.find({ exam: { $in: examIds } })
      .populate('student', 'firstName lastName email createdBy')
      .populate('exam', 'title')
      .select('student exam isCompleted totalScore maxPossibleScore endTime');

    // Get unique students who took exams
    const studentsWhoTookExams = [];
    const studentMap = new Map();

    allResults.forEach(result => {
      if (result.student && !studentMap.has(result.student._id.toString())) {
        studentMap.set(result.student._id.toString(), {
          _id: result.student._id,
          name: `${result.student.firstName || ''} ${result.student.lastName || ''}`.trim(),
          email: result.student.email,
          createdBy: result.student.createdBy,
          createdByThisAdmin: result.student.createdBy?.toString() === adminId.toString()
        });
        studentsWhoTookExams.push(studentMap.get(result.student._id.toString()));
      }
    });

    // Count results by status
    const completedResults = allResults.filter(r => r.isCompleted);
    const pendingResults = allResults.filter(r => !r.isCompleted);

    const debugInfo = {
      admin: {
        id: admin._id,
        name: `${admin.firstName} ${admin.lastName}`,
        email: admin.email,
        role: admin.role
      },
      exams: {
        total: exams.length,
        locked: exams.filter(e => e.isLocked).length,
        unlocked: exams.filter(e => !e.isLocked).length,
        list: exams.map(e => ({
          id: e._id,
          title: e.title,
          isLocked: e.isLocked,
          createdAt: e.createdAt
        }))
      },
      students: {
        createdByThisAdmin: studentsCreatedByAdmin.length,
        whoTookExams: studentsWhoTookExams.length,
        createdByThisAdminList: studentsCreatedByAdmin.map(s => ({
          id: s._id,
          name: `${s.firstName} ${s.lastName}`,
          email: s.email
        })),
        whoTookExamsList: studentsWhoTookExams
      },
      results: {
        total: allResults.length,
        completed: completedResults.length,
        pending: pendingResults.length,
        completedList: completedResults.map(r => ({
          id: r._id,
          student: r.student ? `${r.student.firstName} ${r.student.lastName}` : 'Unknown',
          exam: r.exam?.title || 'Unknown',
          score: `${r.totalScore}/${r.maxPossibleScore}`,
          percentage: r.maxPossibleScore > 0 ? Math.round((r.totalScore / r.maxPossibleScore) * 100) : 0,
          completedAt: r.endTime
        }))
      }
    };

    res.json(debugInfo);
  } catch (error) {
    console.error('Debug admin data error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get student results for admin to review and regrade
// @route   GET /api/admin/student-results
// @access  Private/Admin
const getStudentResultsForRegrade = async (req, res) => {
  try {
    console.log('=== ADMIN STUDENT RESULTS ENDPOINT HIT ===');
    console.log('Query params:', req.query);
    console.log('Admin user:', req.user._id);

    const { examId, studentId, status, sortBy = 'endTime', sortOrder = 'desc' } = req.query;

    // Build query for results
    let query = { isCompleted: true };

    // Get students created by this admin
    const students = await User.find({
      role: 'student',
      createdBy: req.user._id
    }).select('_id');

    const studentIds = students.map(student => student._id);

    // Get exams created by this admin
    const exams = await Exam.find({ createdBy: req.user._id }).select('_id');
    const examIds = exams.map(exam => exam._id);

    console.log(`Admin ${req.user._id} has ${studentIds.length} students and ${examIds.length} exams`);

    // Filter by admin's students and exams - but be more flexible
    if (studentIds.length > 0 && examIds.length > 0) {
      query.$or = [
        { student: { $in: studentIds }, exam: { $in: examIds } }, // Both student and exam by admin
        { student: { $in: studentIds } }, // Student by admin (any exam)
        { exam: { $in: examIds } } // Exam by admin (any student)
      ];
    } else if (studentIds.length > 0) {
      query.student = { $in: studentIds };
    } else if (examIds.length > 0) {
      query.exam = { $in: examIds };
    } else {
      // Admin has no students or exams, return empty results
      return res.json({
        results: [],
        summary: {
          totalResults: 0,
          needsReview: 0,
          potentialImprovements: 0,
          averageScore: 0,
          gradeDistribution: { excellent: 0, good: 0, average: 0, poor: 0 }
        },
        filters: { examId: examId || null, studentId: studentId || null, status: status || null, sortBy, sortOrder }
      });
    }

    // Apply additional filters
    if (examId) {
      query.exam = examId;
    }

    if (studentId) {
      query.student = studentId;
    }

    if (status) {
      if (status === 'needs-grading') {
        query.$or = [
          { aiGradingStatus: { $ne: 'completed' } },
          { aiGradingStatus: { $exists: false } },
          { 'answers.score': 0, 'answers.textAnswer': { $exists: true, $ne: '' } }
        ];
      } else if (status === 'low-scores') {
        // We'll filter this after getting results
      }
    }

    // Get results with populated data
    const results = await Result.find(query)
      .populate({
        path: 'student',
        select: 'firstName lastName fullName email organization studentClass studentId'
      })
      .populate({
        path: 'exam',
        select: 'title description totalPoints timeLimit'
      })
      .populate({
        path: 'answers.question',
        select: 'text type points correctAnswer section'
      })
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 });

    // Format results with enhanced data for regrading
    const formattedResults = results.map(result => {
      const percentage = result.maxPossibleScore > 0
        ? Math.round((result.totalScore / result.maxPossibleScore) * 100)
        : 0;

      const timeTaken = result.endTime && result.startTime
        ? Math.round((new Date(result.endTime) - new Date(result.startTime)) / (1000 * 60))
        : 0;

      // Analyze answers for regrading opportunities
      const answerAnalysis = {
        totalAnswers: result.answers.length,
        answersWithZeroScore: result.answers.filter(a => (a.score || 0) === 0 && (a.textAnswer || a.selectedOption)).length,
        answersNeedingReview: result.answers.filter(a =>
          !a.feedback ||
          a.feedback.includes('keyword matching') ||
          a.feedback.includes('Unable to grade')
        ).length,
        potentialImprovements: result.answers.filter(a => {
          const question = a.question;
          if (!question) return false;

          // Check for semantic matches that might have been missed
          if (question.type === 'multiple-choice' && a.selectedOption && question.correctAnswer) {
            const selected = (a.selectedOption || '').toLowerCase().trim();
            const correct = (question.correctAnswer || '').toLowerCase().trim();
            return (a.score || 0) === 0 && (
              selected === correct ||
              correct.includes(selected) ||
              selected.includes(correct)
            );
          }
          return false;
        }).length
      };

      return {
        _id: result._id,
        student: {
          _id: result.student._id,
          name: result.student.fullName ||
                `${result.student.firstName || ''} ${result.student.lastName || ''}`.trim(),
          email: result.student.email,
          organization: result.student.organization,
          studentClass: result.student.studentClass,
          studentId: result.student.studentId
        },
        exam: {
          _id: result.exam._id,
          title: result.exam.title,
          description: result.exam.description,
          totalPoints: result.exam.totalPoints,
          timeLimit: result.exam.timeLimit
        },
        scores: {
          totalScore: result.totalScore,
          maxPossibleScore: result.maxPossibleScore,
          percentage
        },
        timing: {
          startTime: result.startTime,
          endTime: result.endTime,
          timeTaken
        },
        grading: {
          aiGradingStatus: result.aiGradingStatus || 'pending',
          needsReview: answerAnalysis.answersNeedingReview > 0 || answerAnalysis.potentialImprovements > 0,
          potentialImprovement: answerAnalysis.potentialImprovements > 0
        },
        analysis: answerAnalysis,
        grade: percentage >= 90 ? 'A' : percentage >= 80 ? 'B' : percentage >= 70 ? 'C' : percentage >= 60 ? 'D' : 'F',
        performance: percentage >= 90 ? 'excellent' : percentage >= 70 ? 'good' : percentage >= 50 ? 'average' : 'poor'
      };
    });

    // Apply low-scores filter if requested
    let filteredResults = formattedResults;
    if (status === 'low-scores') {
      filteredResults = formattedResults.filter(r => r.scores.percentage < 70);
    }

    // Calculate summary statistics
    const summary = {
      totalResults: filteredResults.length,
      needsReview: filteredResults.filter(r => r.grading.needsReview).length,
      potentialImprovements: filteredResults.filter(r => r.grading.potentialImprovement).length,
      averageScore: filteredResults.length > 0
        ? Math.round(filteredResults.reduce((sum, r) => sum + r.scores.percentage, 0) / filteredResults.length)
        : 0,
      gradeDistribution: {
        excellent: filteredResults.filter(r => r.performance === 'excellent').length,
        good: filteredResults.filter(r => r.performance === 'good').length,
        average: filteredResults.filter(r => r.performance === 'average').length,
        poor: filteredResults.filter(r => r.performance === 'poor').length
      }
    };

    res.json({
      results: filteredResults,
      summary,
      filters: {
        examId: examId || null,
        studentId: studentId || null,
        status: status || null,
        sortBy,
        sortOrder
      }
    });

  } catch (error) {
    console.error('Get student results for regrade error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Regrade a specific student result
// @route   POST /api/admin/regrade-result/:resultId
// @access  Private/Admin
const regradeStudentResult = async (req, res) => {
  try {
    const { resultId } = req.params;
    const { method = 'ai', forceRegrade = false } = req.body;

    // Find the result and verify admin ownership
    const result = await Result.findById(resultId)
      .populate({
        path: 'student',
        select: 'firstName lastName email createdBy'
      })
      .populate({
        path: 'exam',
        select: 'title createdBy'
      });

    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }

    // Verify admin has access to this result
    const hasAccess = result.exam.createdBy.toString() === req.user._id.toString() ||
                     result.student.createdBy.toString() === req.user._id.toString();

    if (!hasAccess) {
      return res.status(403).json({ message: 'Not authorized to regrade this result' });
    }

    console.log(`Admin ${req.user._id} regrading result ${resultId} using method: ${method}`);

    let regradingResult;

    // Store the old score before regrading
    const oldScore = result.totalScore || 0;
    const oldPercentage = result.maxPossibleScore > 0 ? Math.round((oldScore / result.maxPossibleScore) * 100) : 0;

    if (method === 'ai') {
      // Use AI regrading
      const { regradeExamResult } = require('../utils/gradeExam');
      regradingResult = await regradeExamResult(resultId, forceRegrade);

      // Ensure we have the old score information
      if (!regradingResult.oldScore) {
        regradingResult.oldScore = oldScore;
        regradingResult.oldPercentage = oldPercentage;
      }
    } else if (method === 'comprehensive') {
      // Use comprehensive AI grading
      const { gradeQuestionByType } = require('../utils/enhancedGrading');

      // Reload result with questions
      const fullResult = await Result.findById(resultId)
        .populate({
          path: 'answers.question',
          select: 'text type points correctAnswer options'
        });

      let totalScore = 0;
      let improvedAnswers = 0;

      for (let i = 0; i < fullResult.answers.length; i++) {
        const answer = fullResult.answers[i];
        const question = answer.question;

        if (!question) continue;

        try {
          const grading = await gradeQuestionByType(question, answer, question.correctAnswer);

          const oldScore = answer.score || 0;
          const newScore = grading.score || 0;

          fullResult.answers[i].score = newScore;
          fullResult.answers[i].feedback = grading.feedback || 'Regraded by admin';
          fullResult.answers[i].isCorrect = newScore >= question.points;
          fullResult.answers[i].correctedAnswer = grading.correctedAnswer || question.correctAnswer;
          fullResult.answers[i].gradingMethod = grading.details?.gradingMethod || 'admin_regrade'; // Track grading method

          totalScore += newScore;

          if (newScore !== oldScore) {
            improvedAnswers++;
            console.log(`Answer ${i}: Score changed from ${oldScore} to ${newScore}`);
          }

        } catch (gradingError) {
          console.error(`Error regrading answer ${i}:`, gradingError.message);
          totalScore += answer.score || 0;
        }
      }

      fullResult.totalScore = totalScore;
      fullResult.aiGradingStatus = 'completed';

      // Save the result to ensure database persistence like regrading system
      await fullResult.save();
      console.log(`Admin regrade completed and saved to database for result ${resultId}`);

      regradingResult = {
        resultId,
        oldScore,
        oldPercentage,
        totalScore,
        maxPossibleScore: fullResult.maxPossibleScore,
        percentage: (totalScore / fullResult.maxPossibleScore) * 100,
        improvedAnswers
      };
    }

    // Get updated result for response
    const updatedResult = await Result.findById(resultId)
      .populate('student', 'firstName lastName email')
      .populate('exam', 'title');

    const newPercentage = updatedResult.maxPossibleScore > 0
      ? Math.round((updatedResult.totalScore / updatedResult.maxPossibleScore) * 100)
      : 0;

    res.json({
      message: 'Result regraded successfully',
      result: {
        _id: updatedResult._id,
        student: `${updatedResult.student.firstName} ${updatedResult.student.lastName}`,
        exam: updatedResult.exam.title,
        oldScore: regradingResult.oldScore || 'N/A',
        newScore: updatedResult.totalScore,
        maxScore: updatedResult.maxPossibleScore,
        oldPercentage: regradingResult.oldPercentage || 'N/A',
        newPercentage,
        improvement: (updatedResult.totalScore - (regradingResult.oldScore || updatedResult.totalScore)),
        method
      }
    });

  } catch (error) {
    console.error('Regrade student result error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  registerStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  toggleSystemLock,
  getSystemLockStatus,
  getExamResults,
  getExamLeaderboard,
  getOverallLeaderboard,
  getDetailedResult,
  exportExamResults,
  getDashboardStats,
  getAllExams,
  getExamById,
  getScheduledExams,
  getRecentExams,
  getRecentStudents,
  toggleExamLock,
  getSecurityAlerts,
  resolveSecurityAlert,
  ignoreSecurityAlert,
  getActivityLogs,
  createExam,
  scheduleExam,
  updateScheduledExam,
  getAllResults,
  getStudentPerformanceAnalytics,
  debugAdminData,
  getStudentResultsForRegrade,
  regradeStudentResult
};
