import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { API_URL } from '../config';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

// Helper function to decode JWT token
const decodeToken = (token) => {
  try {
    const decoded = jwtDecode(token);
    return decoded;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Function to load user data from token
  const loadUser = useCallback(async (forceRefresh = false) => {
    if (isInitialized && !forceRefresh) return; // Only prevent if already initialized and not forcing refresh
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      console.log("Token in localStorage:", token ? "Present" : "Missing");
      
      if (!token) {
        setCurrentUser(null);
        setLoading(false);
        setIsInitialized(true);
        return;
      }
      
      // Try to decode token first
      const decodedToken = decodeToken(token);
      if (!decodedToken) {
        console.log("Token could not be decoded, removing");
        localStorage.removeItem('token');
        setCurrentUser(null);
        setLoading(false);
        setIsInitialized(true);
        return;
      }
      
      // Check if token is expired
      if (decodedToken.exp * 1000 < Date.now()) {
        console.log("Token is expired, removing");
        localStorage.removeItem('token');
        setCurrentUser(null);
        setLoading(false);
        setIsInitialized(true);
        return;
      }
      
      // Set basic user info from token
      const basicUser = {
        id: decodedToken.userId || decodedToken.id,
        name: decodedToken.name,
        email: decodedToken.email,
        role: decodedToken.role
      };
      
      // Set user state immediately from token
      setCurrentUser(basicUser);
      
      // Fetch complete user data from API
      try {
        const response = await axios.get(`${API_URL}/api/users/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.data.success) {
          setCurrentUser(response.data.user);
        } else {
          setError('Error fetching user data');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Keep the basic user info from token if the profile endpoint fails
      }
    } catch (error) {
      console.error('Error loading user:', error);
      
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        localStorage.removeItem('token');
        setCurrentUser(null);
      } else {
        setError('Error connecting to server');
      }
    } finally {
      setLoading(false);
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // Login function
  const handleLogin = async (token) => {
    try {
      // Store token first
      localStorage.setItem('token', token);
      
      // Decode token to get basic user info
      const decodedToken = decodeToken(token);
      if (!decodedToken) {
        throw new Error('Invalid token');
      }
      
      // Set basic user info immediately
      const basicUser = {
        id: decodedToken.userId || decodedToken.id,
        name: decodedToken.name,
        email: decodedToken.email,
        role: decodedToken.role
      };
      
      // Set user state immediately
      setCurrentUser(basicUser);
      
      // Reset initialization flag and load complete user data
      setIsInitialized(false);
      await loadUser(true); // Force refresh to get complete user data
      
      return true;
    } catch (error) {
      console.error('Error during login:', error);
      localStorage.removeItem('token');
      setCurrentUser(null);
      throw error;
    }
  };

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    setIsInitialized(false);
  };

  // Check for token on initial load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !isInitialized) {
      loadUser();
    } else if (!token) {
      setLoading(false);
      setIsInitialized(true);
    }
  }, [loadUser, isInitialized]); // Only depend on these two values

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        loading,
        error,
        handleLogin,
        handleLogout,
        loadUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext; 