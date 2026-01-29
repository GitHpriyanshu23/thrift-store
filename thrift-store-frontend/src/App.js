import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import ProfilePage from './pages/ProfilePage';
import SellerDashboardPage from './pages/SellerDashboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import BecomeSellerPage from './pages/BecomeSellerPage';
import SellPage from './pages/SellPage';
import './styles/global.css';
import { ToastProvider } from './contexts/ToastContext';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <div className="app">
            <Header />
            <main className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route 
                path="/checkout" 
                element={
                  <ProtectedRoute>
                    <CheckoutPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/orders" 
                element={
                  <ProtectedRoute>
                    <OrdersPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/seller-dashboard" 
                element={
                  <ProtectedRoute sellerOnly>
                    <SellerDashboardPage />
                  </ProtectedRoute>
                } 
              />
              <Route path="/become-seller" element={
                <ProtectedRoute>
                  <BecomeSellerPage />
                </ProtectedRoute>
              } />
              <Route path="/sell" element={<SellPage />} />
            </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App; 