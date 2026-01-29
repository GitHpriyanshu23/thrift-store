import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from '../config';
import '../styles/HomePage.css';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const backendUrl = "http://localhost:5001";

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/api/products?limit=8`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch products');
        }
        setFeaturedProducts(data.products);
      } catch (error) {
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1>Welcome to Thrift Store</h1>
          <p>Your Destination for Quality Pre-loved Fashion</p>
          <div className="hero-buttons">
            <Link to="/products?gender=men" className="category-button">
              Men
            </Link>
            <Link to="/products?gender=women" className="category-button">
              Women
            </Link>
          </div>
        </div>
      </div>

      {/* Featured Products */}
      <div className="container">
        <section className="featured-section">
          <div className="section-header">
            <h2>Featured Products</h2>
            <Link to="/products" className="view-all">View All</Link>
          </div>
          
          {loading ? (
            <div className="loading-spinner"></div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : (
            <div className="products-grid">
              {featuredProducts.map((product) => (
                <Link to={`/products/${product._id}`} key={product._id} className="product-card">
                  <div className="product-image">
                    <img 
                      src={product.images[0] ? (product.images[0].startsWith('uploads') ? `${backendUrl}/${product.images[0].replace(/\\/g, '/')}` : product.images[0]) : "https://via.placeholder.com/300x300?text=No+Image"} 
                      alt={product.name} 
                    />
                    <div className="product-overlay">
                      <button className="quick-view">Quick View</button>
                    </div>
                  </div>
                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <p className="price">₹{product.price}</p>
                    <p className="condition">{product.condition}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Categories */}
        <section className="categories-section">
          <div className="categories-container">
            <div className="category-box men">
              <div className="category-content">
                <h2>Men's Collection</h2>
                <p>Discover quality pre-loved menswear</p>
                <Link to="/products?gender=men" className="shop-now">
                  Shop Now
                </Link>
              </div>
            </div>
            <div className="category-box women">
              <div className="category-content">
                <h2>Women's Collection</h2>
                <p>Explore trendy pre-loved womenswear</p>
                <Link to="/products?gender=women" className="shop-now">
                  Shop Now
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="cta-section">
          <div className="cta-content">
            <h2>Have Pre-loved Fashion to Sell?</h2>
            <p>Turn your closet into cash - Start selling today!</p>
            <Link to="/sell" className="sell-button">
              Start Selling
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage; 