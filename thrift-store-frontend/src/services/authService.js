import axios from 'axios';

const API_URL = 'http://localhost:5000';

// Google OAuth login
export const loginWithGoogle = () => {
  // Direct to the actual Google OAuth endpoint in the backend
  window.location.href = `${API_URL}/api/auth/google`;
};

// Login user
export const login = async (email, password) => {
  const response = await axios.post(`${API_URL}/api/auth/login`, { email, password });
  return response.data;
};

// Register user
export const register = async (userData) => {
  const response = await axios.post(`${API_URL}/api/auth/register`, userData);
  return response.data;
};

// Get current user
export const getCurrentUser = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/auth/me`);
    return response.data;
  } catch (error) {
    console.error('Error getting current user:', error);
    throw error;
  }
};

// Set auth token in headers
export const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
}; 