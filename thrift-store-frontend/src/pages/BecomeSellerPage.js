import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { userApi } from '../services/api';
import '../styles/BecomeSellerPage.css';

const BecomeSellerPage = () => {
  const { currentUser, loadUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Add debugging for the current user state
  useEffect(() => {
    console.log("BecomeSellerPage - Current user:", currentUser);
  }, [currentUser]);

  useEffect(() => {
    // If user is already a seller, redirect to sell page
    if (currentUser && currentUser.role === 'seller') {
      navigate('/sell');
    }
  }, [currentUser, navigate]);

  const handleBecomeSeller = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log("Attempting to become a seller...");
      
      // Make sure we have a token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('You must be logged in to become a seller');
      }

      console.log("Token found, making API request...");

      // Call the API to update user role using the userApi service
      const response = await userApi.becomeSeller();

      console.log("API response:", response.data);

      if (response.data.success) {
        setSuccess(true);
        // Reload user data to update role in context
        await loadUser(true); // Force refresh to get updated role
        
        console.log("User role updated successfully!");
        
        // Redirect to sell page after 2 seconds
        setTimeout(() => {
          navigate('/sell');
        }, 2000);
      } else {
        throw new Error(response.data.message || 'Failed to become a seller');
      }
    } catch (error) {
      console.error('Error becoming seller:', error);
      setError(error.response?.data?.message || error.message || 'Failed to become a seller');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="become-seller-page">
        <div className="container">
          <h2>Become a Seller</h2>
          <p>Please log in to continue</p>
          <button 
            onClick={() => navigate('/login', { state: { from: '/become-seller' } })}
            className="login-button"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="become-seller-page">
      <div className="container">
        <h2>Become a Seller</h2>
        <p>Join our marketplace and start selling your products today!</p>
        
        {error && <div className="error-message">{error}</div>}
        {success && (
          <div className="success-message">
            Your account has been upgraded to seller status! Redirecting you to the seller dashboard...
          </div>
        )}
        
        {!success && (
          <div className="info-banner">
            <h2>Why Become a Seller?</h2>
            <div className="benefits">
              <div className="benefit">
                <div className="icon">💰</div>
                <h3>Extra Income</h3>
                <p>Turn your pre-loved items into cash</p>
              </div>
              <div className="benefit">
                <div className="icon">🌱</div>
                <h3>Sustainability</h3>
                <p>Give items a second life</p>
              </div>
              <div className="benefit">
                <div className="icon">🌐</div>
                <h3>Reach Customers</h3>
                <p>Sell to our growing community</p>
              </div>
            </div>
          </div>
        )}
        
        {!success && (
          <button 
            onClick={handleBecomeSeller} 
            disabled={loading || success}
            className="submit-button"
          >
            {loading ? 'Processing...' : 'Become a Seller'}
          </button>
        )}
        
        <div className="seller-agreement">
          <p>By becoming a seller, you agree to our <a href="/terms">Terms and Conditions</a> and <a href="/policies">Seller Policies</a>.</p>
        </div>
      </div>
    </div>
  );
};

export default BecomeSellerPage; 