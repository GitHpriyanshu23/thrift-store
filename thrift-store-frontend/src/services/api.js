import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}/api` : 'http://localhost:5001/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Products API
export const productApi = {
  getAll: (params = {}) => api.get('/products', { params }),
  getProducts: (params = {}) => api.get('/products', { params }),
  getProductById: (id) => api.get(`/products/${id}`),
  getSellerProducts: () => api.get('/products/seller/products'),
  getCategories: () => api.get('/products/categories'),
  createProduct: (productData) => {
    const formData = new FormData();
    
    for (const key in productData) {
      if (key === 'images') {
        for (let i = 0; i < productData.images.length; i++) {
          formData.append('images', productData.images[i]);
        }
      } else {
        formData.append(key, productData[key]);
      }
    }

    return api.post('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  updateProduct: (id, productData) => {
    const formData = new FormData();
    
    for (const key in productData) {
      if (key === 'images' && Array.isArray(productData.images)) {
        for (let i = 0; i < productData.images.length; i++) {
          if (productData.images[i] instanceof File) {
            formData.append('images', productData.images[i]);
          }
        }
      } else {
        formData.append(key, productData[key]);
      }
    }

    return api.put(`/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  deleteProduct: (id) => api.delete(`/products/${id}`),
};

// Cart API
export const cartApi = {
  get: () => api.get('/cart'),
  getCart: () => api.get('/cart'),
  add: (productId, quantity = 1) => api.post('/cart', { productId, quantity }),
  addToCart: (productId, quantity = 1) => api.post('/cart', { productId, quantity }),
  updateItem: (productId, quantity) => api.put(`/cart/${productId}`, { quantity }),
  updateCartItem: (productId, quantity) => api.put(`/cart/${productId}`, { quantity }),
  removeItem: (productId) => api.delete(`/cart/${productId}`),
  removeFromCart: (productId) => api.delete(`/cart/${productId}`),
  clear: () => api.delete('/cart'),
  clearCart: () => api.delete('/cart'),
};

// Order API
export const orderApi = {
  placeOrder: (orderData) => api.post('/orders', orderData),
  getOrders: () => api.get('/orders'),
  getOrderById: (id) => api.get(`/orders/${id}`),
  cancelOrder: (id) => api.put(`/orders/${id}/cancel`),
  updatePaymentStatus: (id, paymentData) => api.put(`/orders/${id}/payment`, paymentData),
};

// Auth API
export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  googleLogin: (token) => api.post('/auth/google', { token }),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
};

// User API
export const userApi = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (userData) => api.put('/users/profile', userData),
  becomeSeller: () => api.put('/users/become-seller'),
  changePassword: (passwordData) => api.put('/users/password', passwordData),
  uploadProfilePicture: (file) => {
    const formData = new FormData();
    formData.append('profilePic', file);
    return api.post('/users/profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  deleteAccount: () => api.delete('/users/account'),
};

// Reviews API
export const reviewApi = {
  getProductReviews: (productId) => api.get(`/reviews/product/${productId}`),
  getUserReviews: () => api.get('/reviews/user'),
  addReview: (productId, reviewData) => api.post(`/reviews/product/${productId}`, reviewData),
  updateReview: (reviewId, reviewData) => api.put(`/reviews/${reviewId}`, reviewData),
  deleteReview: (reviewId) => api.delete(`/reviews/${reviewId}`),
};

export default api; 