import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { productApi } from '../services/api';
import { API_URL } from '../config';

function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const backendUrl = API_URL;
  
  // Filter states
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    gender: searchParams.get('gender') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    condition: searchParams.get('condition') || '',
    sort: searchParams.get('sort') || 'newest'
  });
  
  // Filter options
  const categories = ['clothing', 'electronics', 'home', 'books', 'sports', 'toys', 'other'];
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' }
  ];
  
  // Filter visibility on mobile
  const [showFilters, setShowFilters] = useState(false);

  // Sync filters with URL params when URL changes
  useEffect(() => {
    setFilters({
      category: searchParams.get('category') || '',
      gender: searchParams.get('gender') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      condition: searchParams.get('condition') || '',
      sort: searchParams.get('sort') || 'newest'
    });
  }, [searchParams]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Convert filters to query params, removing empty values
        const params = Object.entries(filters).reduce((acc, [key, value]) => {
          if (value) acc[key] = value;
          return acc;
        }, {});
        
        console.log('Fetching products with params:', params);
        const response = await productApi.getAll(params);
        console.log('Products API response:', response.data);
        const productsData = response.data.products || response.data || [];
        console.log('Setting products:', productsData);
        setProducts(productsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load products');
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    
    // Update URL query params
    const newSearchParams = new URLSearchParams(searchParams);
    if (value) {
      newSearchParams.set(name, value);
    } else {
      newSearchParams.delete(name);
    }
    setSearchParams(newSearchParams);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      gender: '',
      minPrice: '',
      maxPrice: '',
      condition: '',
      sort: 'newest'
    });
    setSearchParams({});
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Products</h1>
      
      {/* Mobile filter toggle */}
      <div className="md:hidden mb-4">
        <button 
          className="w-full py-2 bg-primary text-white rounded-md"
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters - hidden on mobile unless toggled */}
        <div className={`md:w-1/4 ${showFilters ? 'block' : 'hidden md:block'}`}>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Filters</h2>
              <button 
                className="text-sm text-primary hover:underline"
                onClick={clearFilters}
              >
                Clear All
              </button>
            </div>
            
            {/* Category Filter */}
            <div className="mb-6">
              <label className="block text-gray-700 mb-2 font-medium">Category</label>
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Gender Filter */}
            <div className="mb-6">
              <label className="block text-gray-700 mb-2 font-medium">Target Audience</label>
              <select
                name="gender"
                value={filters.gender}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All</option>
                <option value="men">Men</option>
                <option value="women">Women</option>
                <option value="unisex">Unisex</option>
              </select>
            </div>
            
            {/* Price Range Filter */}
            <div className="mb-6">
              <label className="block text-gray-700 mb-2 font-medium">Price Range</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  name="minPrice"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  className="w-1/2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <span>-</span>
                <input
                  type="number"
                  name="maxPrice"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  className="w-1/2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            
            {/* Condition Filter */}
            <div className="mb-6">
              <label className="block text-gray-700 mb-2 font-medium">Condition (1-5)</label>
              <select
                name="condition"
                value={filters.condition}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Any Condition</option>
                <option value="5">5 - Like New</option>
                <option value="4">4 - Great</option>
                <option value="3">3 - Good</option>
                <option value="2">2 - Fair</option>
                <option value="1">1 - Poor</option>
              </select>
            </div>
            
            {/* Sort Order */}
            <div>
              <label className="block text-gray-700 mb-2 font-medium">Sort By</label>
              <select
                name="sort"
                value={filters.sort}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {/* Products Grid */}
        <div className="md:w-3/4">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-12">{error}</div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600 mb-4">No products found matching your filters.</p>
              <button 
                onClick={clearFilters}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Link 
                  key={product._id} 
                  to={`/products/${product._id}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer block"
                >
                  <div className="relative pb-[56.25%]">
                    <img 
                      src={product.images && product.images[0] ? (product.images[0].startsWith('uploads') ? `${backendUrl}/${product.images[0].replace(/\\/g, '/')}` : product.images[0]) : "https://via.placeholder.com/300x300?text=No+Image"} 
                      alt={product.name}
                      className="absolute h-full w-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2 truncate">{product.name}</h3>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500 capitalize">{product.category}</span>
                      <span className="text-xs text-gray-600 capitalize">{product.condition}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-primary text-lg font-bold">₹{product.price}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductsPage; 