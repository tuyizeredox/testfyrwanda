// This file serves as the main entry point for Vercel serverless functions
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// CORS configuration - very permissive for debugging
app.use((req, res, next) => {
  // Allow all origins for now to debug
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Standard middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files - adjust for Vercel deployment
const uploadsPath = process.env.NODE_ENV === 'production'
  ? path.join('/tmp/uploads') // Use /tmp for Vercel serverless functions
  : path.join(__dirname, '../../uploads');

app.use('/uploads', express.static(uploadsPath));

// Import routes
const authRoutes = require('../routes/auth');
const adminRoutes = require('../routes/admin');
const studentRoutes = require('../routes/student');
const examRoutes = require('../routes/exam');
const profileRoutes = require('../routes/profile');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/exam', examRoutes);
app.use('/api/profile', profileRoutes);

// Health check endpoint for Vercel
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    environment: process.env.NODE_ENV,
    cors: 'enabled',
    timestamp: new Date().toISOString()
  });
});

// CORS test endpoint
app.get('/api/cors-test', (req, res) => {
  res.status(200).json({
    message: 'CORS is working correctly!',
    origin: req.headers.origin || 'No origin header',
    headers: req.headers,
    timestamp: new Date().toISOString()
  });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    
    // Only start the server in development mode
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
