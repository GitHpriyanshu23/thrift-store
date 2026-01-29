import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cartApi, orderApi } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { API_URL } from '../config';

function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [address, setAddress] = useState({
    fullName: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: ''
  });

  useEffect(() => {
    const fromState = location.state?.items;
    if (Array.isArray(fromState) && fromState.length) {
      setItems(fromState);
      setLoading(false);
    } else {
      fetchCart();
    }
  }, [location.state]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await cartApi.get();
      const cart = response.data.cart || response.data || { items: [] };
      setItems(cart.items || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setError('Failed to load your cart items');
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    return (items || []).reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0).toFixed(2);
  };

  const handlePlaceOrder = async () => {
    if (!items || items.length === 0) {
      setError('Your cart is empty');
      return;
    }

    // Basic validation for address
    if (!address.fullName || !address.phone || !address.line1 || !address.city || !address.state || !address.postalCode) {
      setError('Please fill all required address fields');
      return;
    }

    try {
      setIsProcessing(true);
      const orderPayload = {
        items: items.map(i => ({
          product: {
            _id: i.product._id,
            name: i.product.name,
            price: i.product.price,
            images: i.product.images || []
          },
          quantity: i.quantity,
          price: i.product.price * i.quantity
        })),
        totalAmount: Number(calculateTotal()),
        shippingAddress: address,
        paymentMethod
      };

      await orderApi.placeOrder(orderPayload);
      // Clear cart
      await cartApi.clearCart().catch(() => {});
      showToast('✓ Order placed successfully! Check your orders.', { type: 'success', duration: 3000 });
      setTimeout(() => {
        setOrderPlaced(true);
        setIsProcessing(false);
      }, 500);
    } catch (error) {
      console.error('Error placing order:', error);
      const msg = error.response?.data?.message || 'Failed to place your order';
      showToast(msg, { type: 'error', duration: 3000 });
      setError(msg);
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">✓ Order Placed Successfully!</h2>
          <p className="mb-6 text-gray-600">Your order has been confirmed. Track it in My Orders.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/orders')}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition"
            >
              View My Orders
            </button>
            <button 
              onClick={() => navigate('/products')}
              className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">
          <p>{error}</p>
        </div>
      )}
      
      {(!items || items.length === 0) ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
          <p className="mb-6 text-gray-600">Add some items to your cart before proceeding to checkout.</p>
          <button 
            onClick={() => navigate('/products')}
            className="px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-opacity-90 transition"
          >
            Browse Products
          </button>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Order Summary */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              
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
                        Quantity
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {items.map((item) => (
                      <tr key={item.product._id}>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-12 w-12 flex-shrink-0 rounded overflow-hidden">
                              <img
                                src={item.product.images && item.product.images[0]
                                  ? (item.product.images[0].startsWith('uploads')
                                      ? `${API_URL.replace('/api','')}/${item.product.images[0].replace(/\\/g,'/')}`
                                      : item.product.images[0])
                                  : 'https://via.placeholder.com/48?text=No+Image'}
                                alt={item.product.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{item.product.name}</div>
                              <div className="text-sm text-gray-500 capitalize">{item.product.category}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">₹{item.product.price}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{item.quantity}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            ₹{(item.product.price * item.quantity).toFixed(2)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Address & Payment */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h2 className="text-lg font-semibold mb-4">Delivery Address</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input className="border rounded px-3 py-2" placeholder="Full Name" value={address.fullName} onChange={e=>setAddress({...address, fullName:e.target.value})} />
                <input className="border rounded px-3 py-2" placeholder="Phone" value={address.phone} onChange={e=>setAddress({...address, phone:e.target.value})} />
                <input className="border rounded px-3 py-2 md:col-span-2" placeholder="Address line 1" value={address.line1} onChange={e=>setAddress({...address, line1:e.target.value})} />
                <input className="border rounded px-3 py-2 md:col-span-2" placeholder="Address line 2 (optional)" value={address.line2} onChange={e=>setAddress({...address, line2:e.target.value})} />
                <input className="border rounded px-3 py-2" placeholder="City" value={address.city} onChange={e=>setAddress({...address, city:e.target.value})} />
                <input className="border rounded px-3 py-2" placeholder="State" value={address.state} onChange={e=>setAddress({...address, state:e.target.value})} />
                <input className="border rounded px-3 py-2" placeholder="Postal Code" value={address.postalCode} onChange={e=>setAddress({...address, postalCode:e.target.value})} />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h2 className="text-lg font-semibold mb-4">Payment Options</h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input type="radio" name="payment" value="cod" checked={paymentMethod==='cod'} onChange={()=>setPaymentMethod('cod')} />
                  <span>Cash on Delivery</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="radio" name="payment" value="razorpay" checked={paymentMethod==='razorpay'} onChange={()=>setPaymentMethod('razorpay')} />
                  <span>Razorpay (demo)</span>
                </label>
              </div>
            </div>
          </div>
          
          {/* Payment Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
              <h2 className="text-lg font-semibold mb-4">Payment Summary</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between pb-4">
                  <span>Subtotal</span>
                  <span>${calculateTotal()}</span>
                </div>
                
                <div className="flex justify-between pb-4 border-b">
                  <span>Shipping Fee</span>
                  <span>$0.00</span>
                </div>
                
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span className="text-primary">${calculateTotal()}</span>
                </div>
                
                <button
                  onClick={handlePlaceOrder}
                  disabled={isProcessing || !items || items.length === 0}
                  className={`w-full py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition mt-4 ${
                    (isProcessing || !items || items.length === 0) ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isProcessing ? 'Processing...' : '✓ Place Your Order'}
                </button>
                
                <div className="text-center mt-4">
                  <button 
                    onClick={() => navigate('/cart')}
                    className="text-sm text-primary hover:underline"
                  >
                    Back to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CheckoutPage; 