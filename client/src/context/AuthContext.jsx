import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import LoadingScreen from '../components/common/LoadingScreen';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);

  // Check for saved user on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get saved user from localStorage
        const savedUser = localStorage.getItem('user');
        const savedToken = localStorage.getItem('token');

        if (savedUser && savedToken) {
          // Parse the user data
          const userData = JSON.parse(savedUser);

          // Verify token with the server (optional but recommended)
          try {
            // Make a request to verify the token
            await api.get('/auth/verify');

            // If successful, set the user
            setUser(userData);
          } catch (err) {
            console.error('Token verification failed:', err);
            // Clear invalid auth data
            localStorage.removeItem('user');
            localStorage.removeItem('token');
          }
        }
      } catch (err) {
        console.error('Error checking authentication:', err);
        // Clear potentially corrupted data
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      } finally {
        // Set loading to false when done
        setLoading(false);
        setInitialized(true);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      let response;
      let user;

      try {
        // First try the regular API
        console.log('Attempting login with regular API');
        response = await api.post('/auth/login', {
          email: userData.email,
          password: userData.password,
        });

        // Create user object from response
        user = {
          id: response.data._id,
          email: response.data.email,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          role: response.data.role,
          token: response.data.token,
        };
      } catch (apiError) {
        console.error('Regular API login failed, trying direct login:', apiError);

        // If regular API fails, try direct login
        // Import the direct login function dynamically to avoid circular dependencies
        const { directLogin } = await import('../services/directLogin');

        // Try direct login
        const directLoginData = await directLogin({
          email: userData.email,
          password: userData.password,
        });

        // Create user object from direct login response
        user = {
          id: directLoginData._id,
          email: directLoginData.email,
          firstName: directLoginData.firstName,
          lastName: directLoginData.lastName,
          role: directLoginData.role,
          token: directLoginData.token,
        };
      }

      // Save user to localStorage
      localStorage.setItem('user', JSON.stringify(user));
      // Also save token separately for API interceptor
      localStorage.setItem('token', response.data.token);
      setUser(user);
      setLoading(false);
      return user;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      // Make API call to register endpoint using axios
      const response = await api.post('/auth/register', {
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        institution: userData.institution || '',
        phone: userData.phone || '',
      });

      // Create user object from response
      const user = {
        id: response.data._id,
        email: response.data.email,
        firstName: response.data.firstName,
        lastName: response.data.lastName,
        role: response.data.role,
        token: response.data.token,
      };

      // Save user to localStorage
      localStorage.setItem('user', JSON.stringify(user));
      // Also save token separately for API interceptor
      localStorage.setItem('token', response.data.token);
      setUser(user);
      setLoading(false);
      return user;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  // Computed property to check if user is authenticated
  const isAuthenticated = !!user;

  // Function to update user profile data
  const updateUserProfile = (userData) => {
    if (user && userData) {
      // Create updated user object
      const updatedUser = {
        ...user,
        firstName: userData.firstName || user.firstName,
        lastName: userData.lastName || user.lastName,
        class: userData.class,
        organization: userData.organization
      };

      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));

      // Update state
      setUser(updatedUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isAuthenticated,
        initialized,
        login,
        register,
        logout,
        updateUserProfile
      }}
    >
      {initialized ? children : <LoadingScreen message="Verifying authentication..." />}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
