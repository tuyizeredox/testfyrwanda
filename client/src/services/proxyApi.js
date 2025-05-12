/**
 * Proxy API service that uses a CORS proxy to bypass CORS restrictions
 */
import axios from 'axios';

// Get the API URL from environment variables
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
console.log('Original API URL:', apiUrl);

// CORS Proxy URL - we'll use a public CORS proxy service
// Note: For production, you should set up your own proxy or use a more reliable service
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';

// Create axios instance with the proxy
const proxyApi = axios.create({
  baseURL: CORS_PROXY + apiUrl,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest' // Required by some CORS proxies
  }
});

// Add a request interceptor
proxyApi.interceptors.request.use(
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
    console.log(`Proxy API Request: ${config.method.toUpperCase()} ${config.url}`);
    
    return config;
  },
  (error) => {
    console.error('Proxy API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor
proxyApi.interceptors.response.use(
  (response) => {
    // Log successful response for debugging
    console.log(`Proxy API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    // Log error response for debugging
    console.error('Proxy API Error Response:', error);
    
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Clear localStorage and redirect to login
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default proxyApi;
