import axios from 'axios';

// Get the API URL from environment variables
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
console.log('API URL:', apiUrl); // Debug log

// Create axios instance with enhanced configuration
const api = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json'
  },
  // Enable credentials for CORS
  withCredentials: false
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    let token = null;
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        token = user.token;
      }
    } catch (err) {
      console.error('Error parsing user data:', err);
    }

    // If token exists, add to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request for debugging
    console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);

    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => {
    // Log successful response for debugging
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    // Log error response for debugging
    console.error('API Error Response:', error);

    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Clear localStorage and redirect to login
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    // Handle CORS errors
    if (error.message && error.message.includes('Network Error')) {
      console.error('Possible CORS issue detected');
      // You could implement a fallback strategy here
    }

    return Promise.reject(error);
  }
);

export default api;
