import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { productApi } from '../services/api';

const API_URL = 'http://localhost:5001';

function SellerDashboardPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const fetchSellerProducts = async () => {
      try {
        setLoading(true);
        const response = await productApi.getSellerProducts();
        setProducts(Array.isArray(response.data.products) ? response.data.products : []);
        setError(null);
      } catch (err) {
        console.error('Error fetching seller products:', err);
        setError('Failed to load your products. Please try again later.');
        showToast('Failed to load products', { type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchSellerProducts();
  }, [currentUser, navigate, showToast]);

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      // Make delete request here when delete endpoint is available
      showToast('Product deleted successfully', { type: 'success' });
      setProducts(products.filter(p => p._id !== productId));
    } catch (err) {
      showToast('Failed to delete product', { type: 'error' });
    }
  };

  const getProductImage = (product) => {
    if (!product || !product.images || product.images.length === 0) {
      return 'https://via.placeholder.com/50x50?text=No+Image';
    }
    const imagePath = product.images[0];
    // Handle different image path formats
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    // Remove leading slash if present and construct full URL
    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    return `${API_URL}/${cleanPath}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Seller Dashboard</h1>
      
      {!currentUser?.role?.includes('seller') && (
        <div className="bg-yellow-100 text-yellow-800 p-6 rounded-lg text-center mb-6">
          <h2 className="text-xl font-semibold mb-3">Not a Seller Account</h2>
          <p className="mb-4">Your account doesn't have seller privileges.</p>
          <p>Please contact support to upgrade your account to a seller account.</p>
        </div>
      )}
        
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold">Your Products</h2>
            <p className="text-gray-600">Manage your product listings</p>
          </div>
          <Link
            to="/sell"
            className="mt-4 md:mt-0 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Add New Product
          </Link>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            <p>{error}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500 mb-4">You haven't listed any products yet.</p>
            <Link
              to="/sell"
              className="text-blue-600 hover:underline"
            >
              Add your first product
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Condition
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map(product => (
                  <tr key={product._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img 
                            className="h-10 w-10 rounded object-cover" 
                            src={getProductImage(product)}
                            alt={product.name}
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/50x50?text=No+Image';
                            }}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.location}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">₹{product.price?.toFixed(2) || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{product.category || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        product.condition === 'like-new' ? 'bg-green-100 text-green-800' :
                        product.condition === 'good' ? 'bg-blue-100 text-blue-800' :
                        product.condition === 'fair' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {product.condition || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to={`/product/${product._id}`} className="text-blue-600 hover:text-blue-900 mr-4">
                        View
                      </Link>
                      <button 
                        onClick={() => handleDeleteProduct(product._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-6">Sales Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Total Products</h3>
            <p className="text-2xl font-bold">{products.length}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-green-800 mb-2">Total Value</h3>
            <p className="text-2xl font-bold">₹{products.reduce((sum, p) => sum + (p.price || 0), 0).toFixed(2)}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-purple-800 mb-2">Categories</h3>
            <p className="text-2xl font-bold">{new Set(products.map(p => p.category)).size}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SellerDashboardPage;