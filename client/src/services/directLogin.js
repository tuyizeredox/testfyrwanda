/**
 * Direct login function that bypasses the API service
 * This is a fallback in case the regular API service encounters CORS issues
 */

// Get the API URL from environment variables
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const loginUrl = `${apiUrl}/auth/login`;

// List of CORS proxies to try
const CORS_PROXIES = [
  // Our own proxy endpoint (should be the most reliable)
  `${new URL(apiUrl).origin}/api/proxy?url=`,
  // Public CORS proxies as fallbacks
  'https://cors-anywhere.herokuapp.com/',
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?'
];

/**
 * Attempt to login directly using fetch API with multiple CORS proxies
 * @param {Object} credentials - User credentials (email, password)
 * @returns {Promise} - Promise that resolves to user data or rejects with error
 */
export const directLogin = async (credentials) => {
  console.log('Attempting direct login with multiple methods');

  // First try direct fetch without proxy
  try {
    console.log('Trying direct fetch without proxy');
    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': window.location.origin
      },
      body: JSON.stringify(credentials),
      mode: 'cors'
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Direct fetch successful');
      return data;
    }
  } catch (error) {
    console.error('Direct fetch failed:', error);
  }

  // Try each CORS proxy
  for (const proxy of CORS_PROXIES) {
    try {
      console.log(`Trying CORS proxy: ${proxy}`);
      const proxyUrl = `${proxy}${loginUrl}`;

      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(credentials)
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`Login successful with proxy: ${proxy}`);

        // Store user data in localStorage
        if (data && data.token) {
          localStorage.setItem('user', JSON.stringify(data));
        }

        return data;
      }
    } catch (error) {
      console.error(`Login failed with proxy ${proxy}:`, error);
    }
  }

  // If all methods fail, try a last resort approach - JSONP-like approach with iframe
  try {
    console.log('Trying last resort approach');

    // Create a form that will be submitted in an iframe
    const formData = new FormData();
    formData.append('email', credentials.email);
    formData.append('password', credentials.password);

    // Create a promise that will be resolved when the iframe loads
    const iframePromise = new Promise((resolve, reject) => {
      // Create an iframe
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);

      // Set up message event listener
      window.addEventListener('message', function messageHandler(event) {
        // Only accept messages from our backend
        if (event.origin !== new URL(apiUrl).origin) return;

        // Remove the iframe and event listener
        document.body.removeChild(iframe);
        window.removeEventListener('message', messageHandler);

        // Resolve with the data
        resolve(event.data);
      }, { once: true });

      // Set timeout to reject the promise after 10 seconds
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
          reject(new Error('Login timeout'));
        }
      }, 10000);

      // Set the iframe src to our login page
      iframe.src = `${apiUrl}/auth/login-iframe.html`;
    });

    const result = await iframePromise;
    return result;
  } catch (error) {
    console.error('Last resort approach failed:', error);
  }

  // If all methods fail, throw an error
  throw new Error('All login methods failed');
};

export default directLogin;
