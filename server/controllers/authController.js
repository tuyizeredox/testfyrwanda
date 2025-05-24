const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, institution, phone } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      institution,
      phone,
      role: 'admin' // Setting role to admin as requested
    });

    if (user) {
      // Generate token
      const token = generateToken(user._id);

      res.status(201).json({
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        token
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation is now handled by middleware for faster processing
    // Optimize database query - select only necessary fields for faster retrieval
    const user = await User.findOne({ email }).select('+password +isBlocked +lastLogin').lean(false);

    // Fast fail for non-existent users
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Fast fail for blocked users
    if (user.isBlocked) {
      return res.status(403).json({ message: 'Your account has been blocked. Please contact an administrator.' });
    }

    // Optimize password comparison - this is the main bottleneck
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token immediately after successful authentication
    const token = generateToken(user._id);

    // Prepare response data
    const responseData = {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      token
    };

    // Send response immediately - don't wait for lastLogin update
    res.json(responseData);

    // Update last login time asynchronously (non-blocking)
    setImmediate(async () => {
      try {
        await User.findByIdAndUpdate(user._id, { lastLogin: Date.now() }, { lean: true });
      } catch (updateError) {
        console.error('Last login update error:', updateError);
        // Don't fail the login for this
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user._id);

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Verify token
// @route   GET /api/auth/verify
// @access  Private
const verifyToken = async (req, res) => {
  try {
    // If the auth middleware passes, the token is valid
    // and req.user is set
    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isVerified: true
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  changePassword,
  verifyToken
};
