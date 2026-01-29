import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, sellerOnly }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading user information...</p>
      </div>
    );
  }

  if (!currentUser) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (sellerOnly && currentUser.role !== 'seller') {
    // Redirect to home page if not a seller but route requires seller role
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute; 