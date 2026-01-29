import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cartApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../config';

function CartPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await cartApi.get();
      setCart(response.data.cart || response.data || { items: [] });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setError('Failed to load your cart');
      setCart({ items: [] });
      setLoading(false);
    }
  };

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      setIsUpdating(true);
      await cartApi.updateItem(productId, newQuantity);
      
      // Update local cart state
      setCart(prevCart => ({
        ...prevCart,
        items: prevCart.items.map(item => 
          item.product._id === productId 
            ? { ...item, quantity: newQuantity } 
            : item
        )
      }));
      
      setIsUpdating(false);
    } catch (error) {
      console.error('Error updating quantity:', error);
      setError('Failed to update quantity');
      setIsUpdating(false);
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      setIsUpdating(true);
      await cartApi.removeItem(productId);
      
      // Update local cart state
      setCart(prevCart => ({
        ...prevCart,
        items: prevCart.items.filter(item => item.product._id !== productId)
      }));
      
      setIsUpdating(false);
    } catch (error) {
      console.error('Error removing item:', error);
      setError('Failed to remove item from cart');
      setIsUpdating(false);
    }
  };

  const calculateTotal = () => {
    if (!cart || !cart.items || cart.items.length === 0) {
      return '0.00';
    }
    return cart.items.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0).toFixed(2);
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">You need to log in to view your cart</h2>
          <p className="mb-6 text-gray-600">Please log in to view your cart and continue shopping</p>
          <Link 
            to="/login"
            state={{ from: '/cart' }}
            className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-opacity-90 transition"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
          <p>{error}</p>
          <button 
            onClick={fetchCart}
            className="mt-2 text-primary hover:underline"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
      
      {!cart || !cart.items || cart.items.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
          <p className="mb-6 text-gray-600">Looks like you haven't added any items to your cart yet.</p>
          <Link 
            to="/products"
            className="px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-opacity-90 transition"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
                      Quantity
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cart.items.map((item) => {
                    const imageUrl = item.product.images && item.product.images[0]
                      ? `${API_URL.replace('/api', '')}/uploads/${item.product.images[0].replace(/\\/g, '/')}`
                      : 'https://via.placeholder.com/64?text=No+Image';
                    
                    return (
                    <tr key={item.product._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-16 w-16 flex-shrink-0 rounded overflow-hidden">
                            <img 
                              src={imageUrl}
                              alt={item.product.name}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/64?text=No+Image';
                              }}
                            />
                          </div>
                          <div className="ml-4">
                            <Link 
                              to={`/products/${item.product._id}`}
                              className="text-sm font-medium text-gray-900 hover:text-primary"
                            >
                              {item.product.name}
                            </Link>
                            <p className="text-sm text-gray-500 capitalize">{item.product.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">₹{item.product.price}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <button 
                            className="px-2 py-1 border border-gray-300 rounded-l-md hover:bg-gray-100"
                            onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                            disabled={isUpdating || item.quantity <= 1}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            readOnly
                            className="w-12 text-center border-t border-b border-gray-300 py-1"
                          />
                          <button 
                            className="px-2 py-1 border border-gray-300 rounded-r-md hover:bg-gray-100"
                            onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                            disabled={isUpdating}
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ₹{(item.product.price * item.quantity).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => handleRemoveItem(item.product._id)}
                          disabled={isUpdating}
                          className="text-red-600 hover:text-red-900"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between border-b pb-4">
                  <span>Subtotal ({cart.items.length} items)</span>
                  <span>₹{calculateTotal()}</span>
                </div>
                
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span className="text-primary">₹{calculateTotal()}</span>
                </div>
                
                <button
                  onClick={() => navigate('/checkout', { state: { source: 'cart', items: cart.items } })}
                  disabled={isUpdating || !cart.items || cart.items.length === 0}
                  className="w-full py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Proceed to Buy
                </button>
                
                <div className="text-center mt-4">
                  <Link 
                    to="/products"
                    className="text-sm text-primary hover:underline"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartPage; 