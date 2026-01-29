import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../config';
import axios from 'axios';
import '../styles/SellPage.css';

const SellPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: 'clothing',
    gender: 'unisex',
    condition: 'new',
    location: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!currentUser) {
      navigate('/login', { state: { from: '/sell' } });
      return;
    }

    try {
      // Validate form data
      if (!formData.name || !formData.price || !formData.description || !formData.location || !imageFile) {
        throw new Error('Please fill all required fields and upload an image');
      }

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('You must be logged in to sell products');
      }

      // Create FormData object
      const productData = new FormData();

      // Add all product fields directly to form data
      productData.append('name', formData.name.trim());
      productData.append('price', parseFloat(formData.price));
      productData.append('description', formData.description.trim());
      productData.append('category', formData.category);
      productData.append('gender', formData.gender);
      productData.append('condition', formData.condition);
      productData.append('location', formData.location.trim());

      // Log data before sending
      console.log('Sending product details:', formData);

      // Add the image file
      if (imageFile) {
        productData.append('images', imageFile);
      }

      // Send request to backend
      const response = await axios.post(
        `${API_URL}/api/products`,
        productData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      console.log('Server response:', response.data);

      if (response.data && response.data.success) {
        setSuccess(true);
        // Reset form
        setFormData({
          name: '',
          price: '',
          description: '',
          category: 'clothing',
          gender: 'unisex',
          condition: 'new',
          location: '',
        });
        setImageFile(null);
        setImagePreview(null);
        
        // Redirect to products page after delay
        setTimeout(() => {
          navigate('/products');
        }, 2000);
      } else {
        throw new Error(response.data.error || 'Failed to create product');
      }
    } catch (err) {
      console.error('Error listing product:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to list product';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // If user is not logged in, redirect to login
  if (!currentUser) {
    return (
      <div className="sell-page">
        <div className="container">
          <div className="sell-container">
            <h2>Please log in to start selling</h2>
            <p>You need to be logged in to list products for sale.</p>
            <button
              onClick={() => navigate('/login', { state: { from: '/sell' } })}
              className="login-button"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If user is logged in but not a seller, redirect to become seller page
  if (currentUser && currentUser.role !== 'seller') {
    return (
      <div className="sell-page">
        <div className="container">
          <div className="sell-container">
            <h2>Become a Seller</h2>
            <p>You need to upgrade your account to seller before you can list products.</p>
            <button
              onClick={() => navigate('/become-seller')}
              className="become-seller-button"
            >
              Become a Seller
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sell-page">
      <div className="container">
        <div className="sell-container">
          <h1>Sell Your Product</h1>
          
          {success && (
            <div className="success-message">
              Product listed successfully! Redirecting to products page...
            </div>
          )}
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="sell-form">
            <div className="form-group">
              <label>Product Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter product name"
              />
            </div>
            
            <div className="form-group">
              <label>Price (₹) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0.01"
                step="0.01"
                required
                placeholder="Enter price"
              />
            </div>

            <div className="form-group">
              <label>Location *</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                placeholder="Enter your location"
              />
            </div>
            
            <div className="form-group">
              <label>Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="clothing">Clothing</option>
                <option value="electronics">Electronics</option>
                <option value="home">Home</option>
                <option value="books">Books</option>
                <option value="accessories">Accessories</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Target Audience *</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <option value="men">Men</option>
                <option value="women">Women</option>
                <option value="unisex">Unisex</option>
              </select>
            </div>

            <div className="form-group">
              <label>Condition *</label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                required
              >
                <option value="new">New</option>
                <option value="like-new">Like New</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="Describe your product"
                rows="4"
              />
            </div>

            <div className="form-group">
              <label>Product Image *</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                required
              />
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" />
                </div>
              )}
            </div>

            <button 
              type="submit" 
              className="list-product-button"
              disabled={loading}
            >
              {loading ? 'Listing Product...' : 'List Product'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SellPage; 