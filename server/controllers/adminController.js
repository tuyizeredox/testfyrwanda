const mongoose = require('mongoose');
const User = require('../models/User');
const SystemConfig = require('../models/SystemConfig');
const Exam = require('../models/Exam');
const Result = require('../models/Result');
const SecurityAlert = require('../models/SecurityAlert');
const ActivityLog = require('../models/ActivityLog');

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
      organization: organization || ''
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

// @desc    Get all students
// @route   GET /api/admin/students
// @access  Private/Admin
const getStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('-password');
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

    if (student && student.role === 'student') {
      res.json(student);
    } else {
      res.status(404).json({ message: 'Student not found' });
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

    if (student && student.role === 'student') {
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

    if (student && student.role === 'student') {
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

    // Check if exam exists
    const exam = await Exam.findById(examId);

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Get all results for this exam
    const results = await Result.find({ exam: examId })
      .populate('student', 'fullName studentId email organization studentClass')
      .populate('exam', 'title')
      .select('-answers');

    res.json(results);
  } catch (error) {
    console.error('Get exam results error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get overall leaderboard across all exams
// @route   GET /api/admin/leaderboard
// @access  Private/Admin
const getOverallLeaderboard = async (req, res) => {
  try {
    // Get all completed results
    const results = await Result.find({
      isCompleted: true
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

    res.json({
      examTitle: "All Exams",
      leaderboard: leaderboardData
    });
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

    // Check if exam exists
    const exam = await Exam.findById(examId);

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Get all completed results for this exam
    const results = await Result.find({
      exam: examId,
      isCompleted: true
    })
      .populate({
        path: 'student',
        select: 'firstName lastName email organization class',
        options: { virtuals: true }
      })
      .populate('exam', 'title maxPossibleScore')
      .select('totalScore maxPossibleScore startTime endTime');

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

    res.json({
      examTitle: exam.title,
      leaderboard: leaderboardData
    });
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
      .populate('student', 'fullName studentId email')
      .populate('exam', 'title')
      .populate({
        path: 'answers.question',
        select: 'text type options correctAnswer points section'
      });

    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }

    res.json(result);
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

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard-stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    // Get count of students
    const studentCount = await User.countDocuments({ role: 'student' });

    // Get count of exams
    const examCount = await Exam.countDocuments();

    // Get count of upcoming exams (scheduled in the future)
    const upcomingExams = await Exam.countDocuments({
      scheduledFor: { $gt: new Date() },
      status: 'scheduled'
    });

    // Get count of active exams (not locked)
    const activeExams = await Exam.countDocuments({ isLocked: false });

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
      activeExams,
      upcomingExams,
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

// @desc    Get all exams
// @route   GET /api/admin/exams
// @access  Private/Admin
const getAllExams = async (req, res) => {
  try {
    // Get all exams with populated creator
    const exams = await Exam.find({})
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

// @desc    Get all scheduled exams
// @route   GET /api/admin/scheduled-exams
// @access  Private/Admin
const getScheduledExams = async (req, res) => {
  try {
    // Get all scheduled exams (with scheduledFor date in the future)
    const scheduledExams = await Exam.find({
      scheduledFor: { $ne: null },
      status: 'scheduled'
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

// @desc    Get recent exams
// @route   GET /api/admin/recent-exams
// @access  Private/Admin
const getRecentExams = async (req, res) => {
  try {
    // Get 5 most recent exams
    const recentExams = await Exam.find({})
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

// @desc    Get recent students
// @route   GET /api/admin/recent-students
// @access  Private/Admin
const getRecentStudents = async (req, res) => {
  try {
    // Get 5 most recently registered students
    const recentStudents = await User.find({ role: 'student' })
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

// @desc    Get all exam results
// @route   GET /api/admin/results
// @access  Private/Admin
const getAllResults = async (req, res) => {
  try {
    // Get all results with populated student and exam
    const results = await Result.find({ isCompleted: true })
      .populate('student', 'firstName lastName fullName email')
      .populate('exam', 'title')
      .sort({ endTime: -1 });

    // Format the results
    const formattedResults = results.map(result => ({
      _id: result._id,
      student: {
        _id: result.student?._id || null,
        fullName: result.student?.fullName ||
                 (result.student ? `${result.student.firstName} ${result.student.lastName}` : 'Unknown'),
        email: result.student?.email || 'Unknown'
      },
      exam: {
        _id: result.exam?._id || null,
        title: result.exam?.title || 'Unknown'
      },
      totalScore: result.totalScore,
      maxPossibleScore: result.maxPossibleScore,
      percentage: result.maxPossibleScore > 0
        ? Math.round((result.totalScore / result.maxPossibleScore) * 100)
        : 0,
      startTime: result.startTime,
      endTime: result.endTime,
      isCompleted: result.isCompleted
    }));

    res.json(formattedResults);
  } catch (error) {
    console.error('Get all results error:', error);
    res.status(500).json({ message: 'Server error' });
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
  getAllResults
};
