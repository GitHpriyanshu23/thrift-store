import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Header.css';

const Header = () => {
  const { currentUser, handleLogout } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    handleLogout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <Link to="/">Thrift Store</Link>
        </div>
        
        <nav className="nav-menu">
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/products">Products</Link>
            </li>
            <li>
              <Link to="/cart">Cart</Link>
            </li>
          </ul>
        </nav>
        
        <div className="auth-buttons">
          {currentUser ? (
            <div className="user-menu">
              <div className="user-info">
                Welcome, {currentUser.name || 'User'}
              </div>
              <div className="dropdown">
                <Link to="/profile">My Profile</Link>
                <Link to="/orders">My Orders</Link>
                {currentUser.role === 'seller' ? (
                  <Link to="/seller-dashboard">Seller Dashboard</Link>
                ) : (
                  <Link to="/become-seller">Become a Seller</Link>
                )}
                <button onClick={onLogout}>Logout</button>
              </div>
            </div>
          ) : (
            <>
              <Link to="/login" className="login-btn">Login</Link>
              <Link to="/register" className="register-btn">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header; 