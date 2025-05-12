/**
 * Direct login function that bypasses the API service
 * This is a fallback in case the regular API service encounters CORS issues
 */

// Get the API URL from environment variables
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const loginUrl = `${apiUrl}/auth/login`;

/**
 * Attempt to login directly using fetch API
 * @param {Object} credentials - User credentials (email, password)
 * @returns {Promise} - Promise that resolves to user data or rejects with error
 */
export const directLogin = async (credentials) => {
  console.log('Attempting direct login with fetch API');
  
  try {
    // First try an OPTIONS request to check CORS
    const optionsResponse = await fetch(loginUrl, {
      method: 'OPTIONS',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('OPTIONS response status:', optionsResponse.status);
    
    // Now try the actual login
    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Login failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    // Store user data in localStorage
    if (data && data.token) {
      localStorage.setItem('user', JSON.stringify(data));
    }
    
    return data;
  } catch (error) {
    console.error('Direct login error:', error);
    throw error;
  }
};

export default directLogin;
