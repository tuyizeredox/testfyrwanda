import axios from 'axios';

// In Vite, environment variables are accessed via import.meta.env instead of process.env
// And they need to be prefixed with VITE_ instead of REACT_APP_
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 8000 // 8 seconds default timeout - can be overridden per request
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const user = JSON.parse(localStorage.getItem('user'));

    // If token exists, add to headers
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Clear localStorage and redirect to login
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;
