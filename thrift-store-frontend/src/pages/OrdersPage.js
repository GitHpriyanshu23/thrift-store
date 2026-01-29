import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../config';

function OrdersPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [isAuthenticated, navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderApi.getOrders();
      const ordersData = Array.isArray(response.data) ? response.data : response.data.orders || [];
      setOrders(ordersData);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load your orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Please Log In</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to view your orders</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">
          <p>{error}</p>
          <button
            onClick={fetchOrders}
            className="mt-2 text-red-600 hover:text-red-800 underline text-sm"
          >
            Try Again
          </button>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">No Orders Yet</h2>
          <p className="text-gray-600 mb-6">You haven't placed any orders yet. Start shopping!</p>
          <button
            onClick={() => navigate('/products')}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition"
          >
            Browse Products
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 pb-4 border-b">
                <div>
                  <h3 className="text-lg font-semibold">Order #{order._id}</h3>
                  <p className="text-sm text-gray-600">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Date not available'}
                  </p>
                </div>
                <div className="mt-4 md:mt-0 flex gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                    {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Pending'}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                    {order.paymentStatus ? `Payment: ${order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}` : 'Payment Pending'}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold mb-2">Items Ordered</h4>
                <div className="space-y-2">
                  {(order.items || []).map((item, idx) => (
                    <div key={idx} className="flex gap-4 p-3 bg-gray-50 rounded">
                      {item.product && item.product.images && item.product.images[0] && (
                        <img
                          src={
                            item.product.images[0].startsWith('uploads')
                              ? `${API_URL.replace('/api', '')}/${item.product.images[0].replace(/\\/g, '/')}`
                              : item.product.images[0]
                          }
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/64?text=Product';
                          }}
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{item.product?.name || 'Unknown Product'}</p>
                        <p className="text-sm text-gray-600">
                          Qty: {item.quantity} × ₹{item.product?.price?.toFixed(2) || '0.00'} = ₹{item.price?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-4 p-3 bg-gray-50 rounded">
                <h4 className="font-semibold mb-2">Delivery Address</h4>
                {order.shippingAddress ? (
                  <p className="text-sm text-gray-700">
                    {order.shippingAddress.fullName}<br />
                    {order.shippingAddress.line1}
                    {order.shippingAddress.line2 && <>, {order.shippingAddress.line2}</>}
                    <br />
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                  </p>
                ) : (
                  <p className="text-sm text-gray-600">No address provided</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Order Total</p>
                  <p className="text-2xl font-bold text-blue-600">₹{order.totalAmount?.toFixed(2) || '0.00'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Method</p>
                  <p className="text-base font-medium">
                    {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Razorpay'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default OrdersPage; 