// Import React hooks for context and state management
import { createContext, useState, useEffect, useContext } from 'react';
// Import API functions for authentication
import { login as loginApi, register as registerApi } from '../services/api';

// Create Auth Context
const AuthContext = createContext();

// Custom hook to use Auth Context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  // State to store user information
  const [user, setUser] = useState(null);
  // State to track if auth data is being loaded
  const [loading, setLoading] = useState(true);

  // Check if user is logged in when component mounts
  useEffect(() => {
    // Try to validate token and fetch fresh user data from server
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    // Use API call to validate token and fetch current user
    import('../services/api').then(({ default: api }) => {
      api.get('/auth/me').then((res) => {
        if (res.data && res.data.success) {
          setUser(res.data.data);
          localStorage.setItem('user', JSON.stringify(res.data.data));
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
        setLoading(false);
      }).catch(() => {
        // If validation fails, clear stored credentials
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setLoading(false);
      });
    });
  }, []);

  // Register function - do NOT auto-login after register (explicit login required)
  const register = async (userData) => {
    try {
      // Call register API
      const response = await registerApi(userData);
      return response;
    } catch (error) {
      // Handle errors
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
      };
    }
  };

  // Login function
  const login = async (credentials) => {
    try {
      // Call login API
      const response = await loginApi(credentials);

      // If login successful, save token and user data
      if (response.success && response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.data));
        setUser(response.data);
      }

      return response;
    } catch (error) {
      // Handle errors
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  };

  // Logout function
  const logout = () => {
    // Remove token and user data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Clear user state
    setUser(null);
  };

  // Check if user is authenticated
  const isAuthenticated = !!user;

  // Value to be provided by context
  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};


