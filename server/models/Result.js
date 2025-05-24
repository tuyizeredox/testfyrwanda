const mongoose = require('mongoose');

const ResultSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true
  },
  startTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  answers: [{
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true
    },
    selectedOption: {
      type: String // For multiple choice - stores the text of the selected option
    },
    selectedOptionLetter: {
      type: String // For multiple choice - stores the letter (A, B, C, D) of the selected option
    },
    correctOptionLetter: {
      type: String // For multiple choice - stores the letter of the correct option
    },
    textAnswer: {
      type: String // For open-ended
    },
    isCorrect: {
      type: Boolean
    },
    score: {
      type: Number,
      default: 0
    },
    feedback: {
      type: String // AI feedback for open-ended questions
    },
    correctedAnswer: {
      type: String // Correct answer for reference
    },
    isSelected: {
      type: Boolean,
      default: true // By default, all questions are selected
    },
    // For matching questions
    matchingAnswers: [{
      left: Number,
      right: Number
    }],
    // For ordering questions
    orderingAnswer: [Number],
    // For drag-drop questions
    dragDropAnswer: [{
      item: Number,
      zone: Number
    }],
    // For multi-part questions
    subAnswers: [{
      selectedOption: String,
      textAnswer: String,
      isCorrect: Boolean,
      score: Number
    }],
    // Answer metadata
    timeSpent: {
      type: Number, // in seconds
      default: 0
    },
    attempts: {
      type: Number,
      default: 1
    },
    confidence: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    // Grading method tracking
    gradingMethod: {
      type: String,
      enum: [
        'enhanced_grading',
        'semantic_match',
        'direct_comparison',
        'keyword_matching',
        'default_fallback',
        'background_ai_grading',
        'manual_grading',
        'ai_grading',
        'regrade_ai_grading',
        'admin_regrade',
        'ai_assisted',
        'predefined',
        'error_fallback',
        'fallback'
      ],
      default: 'enhanced_grading'
    }
  }],
  totalScore: {
    type: Number,
    default: 0
  },
  maxPossibleScore: {
    type: Number,
    required: true
  },
  aiGradingStatus: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'failed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Result', ResultSchema);
