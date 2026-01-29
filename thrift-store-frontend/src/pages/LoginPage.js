import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../config';
import { FcGoogle } from 'react-icons/fc';
import '../styles/LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { currentUser, handleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check for token in URL (for OAuth redirects)
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get('token');
    const errorMsg = searchParams.get('error');
    
    if (token) {
      // Log the user in with the token from the URL
      console.log('Token found in URL, logging in user');
      handleLogin(token)
        .then(() => {
          // Clear the token from the URL
          navigate('/', { replace: true });
        })
        .catch(err => {
          console.error('Error logging in with token from URL:', err);
          setError('Failed to authenticate with token. Please try again.');
        });
    } else if (errorMsg) {
      setError(decodeURIComponent(errorMsg));
    }
  }, [location, handleLogin, navigate]);

  useEffect(() => {
    if (currentUser) {
      const redirectTo = location.state?.from || '/';
      navigate(redirectTo, { replace: true });
    }
  }, [currentUser, location, navigate]);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      // Call your email login API endpoint
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to login');
      }
      
      await handleLogin(data.token);
      navigate('/', { replace: true });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/api/auth/google`;
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2 className='text-center text-black'>Welcome Back</h2>
        <p>Sign in to access your account</p>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="login-form">
          <div className="form-group">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="divider">OR</div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="google-login-button"
        >
          <FcGoogle className="google-icon" />
          <span>Continue with Google</span>
        </button>

        <div className="signup-link">
          <p>
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/register')}
              className="signup-button"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 