import React, { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Layout() {
  const { currentUser, logout, isAuthenticated, isSeller } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-primary">Thrift Store</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-6">
              <Link to="/" className="text-gray-600 hover:text-primary">Home</Link>
              <Link to="/products" className="text-gray-600 hover:text-primary">Products</Link>
              {isSeller && (
                <Link to="/seller" className="text-gray-600 hover:text-primary">Seller Dashboard</Link>
              )}
            </nav>

            {/* User Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/cart" className="relative text-gray-600 hover:text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </Link>
              
              {isAuthenticated ? (
                <div className="relative group">
                  <button className="flex items-center space-x-1 text-gray-600 hover:text-primary">
                    <span>Hi, {currentUser?.name?.split(' ')[0]}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block">
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</Link>
                    <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Orders</Link>
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-opacity-90">
                  Login
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <button 
              className="md:hidden text-gray-500 hover:text-gray-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="mt-4 py-3 px-2 md:hidden">
              <Link to="/" className="block py-2 text-base text-gray-600 hover:text-primary" onClick={() => setMobileMenuOpen(false)}>Home</Link>
              <Link to="/products" className="block py-2 text-base text-gray-600 hover:text-primary" onClick={() => setMobileMenuOpen(false)}>Products</Link>
              <Link to="/cart" className="block py-2 text-base text-gray-600 hover:text-primary" onClick={() => setMobileMenuOpen(false)}>Cart</Link>
              
              {isSeller && (
                <Link to="/seller" className="block py-2 text-base text-gray-600 hover:text-primary" onClick={() => setMobileMenuOpen(false)}>Seller Dashboard</Link>
              )}
              
              {isAuthenticated ? (
                <>
                  <Link to="/profile" className="block py-2 text-base text-gray-600 hover:text-primary" onClick={() => setMobileMenuOpen(false)}>Profile</Link>
                  <Link to="/orders" className="block py-2 text-base text-gray-600 hover:text-primary" onClick={() => setMobileMenuOpen(false)}>Orders</Link>
                  <button 
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }} 
                    className="block py-2 text-base text-gray-600 hover:text-primary w-full text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link 
                  to="/login" 
                  className="block py-2 text-base text-gray-600 hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
              )}
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Thrift Store</h3>
              <p className="text-gray-300">Buy and sell second-hand items at the best prices.</p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-300 hover:text-white">Home</Link></li>
                <li><Link to="/products" className="text-gray-300 hover:text-white">Products</Link></li>
                <li><Link to="/login" className="text-gray-300 hover:text-white">Login</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
              <p className="text-gray-300">Email: info@thriftstore.com</p>
              <p className="text-gray-300">Phone: +1 123 456 7890</p>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-700 text-center">
            <p className="text-gray-300">© {new Date().getFullYear()} Thrift Store. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Layout; 