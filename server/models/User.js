const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    index: true // Add index for faster login lookups
  },
  password: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },

  phone: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'student'],
    default: 'admin' // Setting default to admin as requested
  },
  class: {
    type: String,
    trim: true
  },
  organization: {
    type: String,
    trim: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  deviceId: {
    type: String,
    default: null
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Hash password before saving - optimized for faster login
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Reduced salt rounds from 10 to 8 for faster password comparison
    // Still secure but significantly faster for login operations
    const salt = await bcrypt.genSalt(8);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Virtual for fullName
UserSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`.trim();
});

module.exports = mongoose.model('User', UserSchema);
