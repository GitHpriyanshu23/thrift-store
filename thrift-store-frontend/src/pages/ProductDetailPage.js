import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { cartApi } from '../services/api';
import { API_URL } from '../config';
import { useToast } from '../contexts/ToastContext';

function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const backendUrl = API_URL;

  const fetchProduct = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await productApi.getProductById(id);
      console.log('Product API response:', response.data);
      const productData = response.data.product || response.data;
      if (!productData || !productData._id) {
        throw new Error('Invalid product data received');
      }
      setProduct(productData);
      if (productData.category) {
        fetchRelatedProducts(productData.category);
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      console.error('Error details:', err.response?.data || err.message);
      setError('Failed to load product details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const fetchRelatedProducts = async (category) => {
    try {
      const response = await productApi.getProducts({ category, limit: 4 });
      // Filter out the current product
      const related = response.data.products.filter(item => item._id !== id);
      setRelatedProducts(related.slice(0, 3)); // Take maximum 3 products
    } catch (err) {
      console.error('Error fetching related products:', err);
      // Not setting error state as this is not critical
    }
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setQuantity(value);
    }
  };

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/product/${id}` } });
      return;
    }

    setAdding(true);
    try {
      await cartApi.addToCart(id, quantity);
      showToast(`${product.name} added to cart! (Qty: ${quantity})`, { type: 'success', duration: 2000 });
    } catch (err) {
      console.error('Error adding to cart:', err);
      showToast('Failed to add product to cart', { type: 'error', duration: 3000 });
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/products/${id}` } });
      return;
    }
    const item = {
      product: {
        _id: product._id,
        name: product.name,
        price: product.price,
        images: product.images || [],
        category: product.category,
      },
      quantity
    };
    navigate('/checkout', { state: { source: 'buy-now', items: [item] } });
  };

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
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link 
            to="/" 
            className="inline-block px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-opacity-90 transition"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
          <p>Product not found.</p>
        </div>
        <Link to="/" className="text-primary hover:underline">
          Return to homepage
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex mb-8 text-sm">
        <Link to="/" className="text-gray-500 hover:text-primary">Home</Link>
        <span className="mx-2 text-gray-500">/</span>
        <Link to={`/category/${product.category}`} className="text-gray-500 hover:text-primary">
          {product.category}
        </Link>
        <span className="mx-2 text-gray-500">/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="lg:flex -mx-4">
        {/* Product Image */}
        <div className="lg:w-1/2 px-4 mb-8 lg:mb-0">
          <div className="bg-gray-100 rounded-lg overflow-hidden">
            <img 
              src={product.images && product.images[0] ? (product.images[0].startsWith('uploads') ? `${backendUrl}/${product.images[0].replace(/\\/g, '/')}` : product.images[0]) : 'https://via.placeholder.com/500x500?text=No+Image'} 
              alt={product.name}
              className="w-full h-auto object-contain min-h-[400px]"
            />
          </div>
        </div>

        {/* Product Info */}
        <div className="lg:w-1/2 px-4">
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          
          <div className="flex items-center mb-6">
            <span className="text-2xl font-bold text-primary">₹{product.price.toFixed(2)}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="ml-3 text-lg text-gray-500 line-through">
                ₹{product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          
          <div className="mb-6 prose max-w-none">
            <p>{product.description}</p>
          </div>
          
          <div className="mb-6">
            <div className="flex items-center text-sm mb-2">
              <span className="mr-2 font-medium">Condition:</span>
              <span className="capitalize px-2 py-1 bg-gray-100 rounded-full">
                {product.condition || 'Used'}
              </span>
            </div>
            <div className="flex items-center text-sm mb-2">
              <span className="mr-2 font-medium">Category:</span>
              <Link to={`/category/${product.category}`} className="text-primary hover:underline">
                {product.category}
              </Link>
            </div>
            <div className="flex items-center text-sm">
              <span className="mr-2 font-medium">Availability:</span>
              {product.status === 'available' ? (
                <span className="text-green-600 font-medium">In Stock</span>
              ) : product.status === 'sold' ? (
                <span className="text-red-600 font-medium">Sold</span>
              ) : (
                <span className="text-yellow-600 font-medium">Reserved</span>
              )}
            </div>
          </div>
          
          {product.status === 'available' ? (
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <span className="mr-4 font-medium">Quantity:</span>
                <div className="flex border border-gray-300 rounded-md">
                  <button 
                    onClick={decreaseQuantity}
                    className="px-3 py-1 border-r border-gray-300 focus:outline-none hover:bg-gray-100"
                    disabled={quantity <= 1}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={handleQuantityChange}
                    min="1"
                    className="w-16 text-center py-1 focus:outline-none"
                  />
                  <button 
                    onClick={increaseQuantity}
                    className="px-3 py-1 border-l border-gray-300 focus:outline-none hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>
              
              <div className="flex gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={adding}
                  className="flex-1 bg-blue-600 text-white py-3 px-8 rounded-md hover:bg-blue-700 focus:outline-none transition flex items-center justify-center font-semibold text-base"
                >
                  {adding ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Adding...
                    </>
                  ) : (
                    <>🛒 Add to Cart</>
                  )}
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={adding}
                  className="flex-1 bg-green-600 text-white py-3 px-8 rounded-md hover:bg-green-700 focus:outline-none transition flex items-center justify-center font-semibold text-base"
                >
                  💳 Buy Now
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 font-semibold text-center">This product is currently not available</p>
            </div>
          )}
          
          {/* Seller Info */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-3">Seller Information</h3>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="font-medium text-gray-700">
                  {product.seller?.name ? product.seller.name.charAt(0).toUpperCase() : 'S'}
                </span>
              </div>
              <div className="ml-3">
                <div className="font-medium">{product.seller?.name || 'Anonymous Seller'}</div>
                <div className="text-sm text-gray-500">Member since {product.seller?.joinDate ? new Date(product.seller.joinDate).toLocaleDateString() : 'N/A'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-8">You May Also Like</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {relatedProducts.map(relatedProduct => {
              const baseUrl = API_URL.replace('/api', '');
              const imageUrl = relatedProduct.images && relatedProduct.images[0]
                ? (relatedProduct.images[0].startsWith('uploads') ? `${baseUrl}/${relatedProduct.images[0].replace(/\\/g, '/')}` : relatedProduct.images[0])
                : 'https://via.placeholder.com/300x300?text=No+Image';
              
              return (
                <div key={relatedProduct._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                  <Link to={`/products/${relatedProduct._id}`}>
                    <div className="aspect-w-1 aspect-h-1 bg-gray-200">
                      <img
                        src={imageUrl}
                        alt={relatedProduct.name}
                        className="object-cover w-full h-48"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-2 hover:text-primary transition">{relatedProduct.name}</h3>
                      <p className="text-primary font-bold">₹{relatedProduct.price.toFixed(2)}</p>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductDetailPage; 