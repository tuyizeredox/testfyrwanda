/**
 * Custom CORS middleware for handling cross-origin requests
 * This provides more control over CORS than the standard cors package
 */

const corsMiddleware = (req, res, next) => {
  // Define allowed origins
  const allowedOrigins = [
    'http://localhost:3000',
    'https://testfyrwanda.vercel.app',
    'https://nationalscore.vercel.app'
  ];

  // Add any custom origins from environment variables
  if (process.env.FRONTEND_URL && !allowedOrigins.includes(process.env.FRONTEND_URL)) {
    allowedOrigins.push(process.env.FRONTEND_URL);
  }

  // Get the origin from the request headers
  const origin = req.headers.origin;

  // Check if the origin is allowed
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    // For requests without origin (like from Postman)
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  // Set other CORS headers
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Continue to the next middleware
  next();
};

module.exports = corsMiddleware;
