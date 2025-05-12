const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Import custom CORS middleware
const corsMiddleware = require('./middleware/cors');

// Apply CORS middleware
app.use(corsMiddleware);

// Standard CORS middleware as fallback
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://testfyrwanda.vercel.app', 'https://nationalscore.vercel.app', process.env.FRONTEND_URL].filter(Boolean)
    : 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Pre-flight OPTIONS request handler
app.options('*', cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files - adjust for Vercel deployment
const uploadsPath = process.env.NODE_ENV === 'production'
  ? path.join('/tmp/uploads') // Use /tmp for Vercel serverless functions
  : path.join(__dirname, '../uploads');

app.use('/uploads', express.static(uploadsPath));

// Import routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const studentRoutes = require('./routes/student');
const examRoutes = require('./routes/exam');
const profileRoutes = require('./routes/profile');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/exam', examRoutes);
app.use('/api/profile', profileRoutes);

// Health check endpoint for Vercel
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', environment: process.env.NODE_ENV });
});

// CORS test endpoint
app.get('/api/cors-test', (req, res) => {
  res.status(200).json({
    message: 'CORS is working correctly!',
    origin: req.headers.origin || 'No origin header',
    headers: req.headers
  });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');

    // Only start the server in development mode
    // In production (Vercel), we use serverless functions
    if (process.env.NODE_ENV !== 'production') {
      const PORT = process.env.PORT || 5000;
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

// Export the Express app for Vercel serverless deployment
module.exports = app;
