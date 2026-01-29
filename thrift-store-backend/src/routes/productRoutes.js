import express from 'express';
import Product from '../models/Product.js';
import { ensureAuth } from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Get all products
router.get('/', async (req, res) => {
  try {
    const { category, gender, minPrice, maxPrice, condition, search, sort } = req.query;
    
    // Build query
    const query = {};
    
    if (category) {
      query.category = category;
    }
    
    if (gender) {
      query.gender = gender;
    }
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    
    if (condition) {
      query.condition = condition;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Build sort options
    let sortOptions = {};
    if (sort) {
      switch (sort) {
        case 'price-asc':
          sortOptions = { price: 1 };
          break;
        case 'price-desc':
          sortOptions = { price: -1 };
          break;
        case 'oldest':
          sortOptions = { createdAt: 1 };
          break;
        default: // 'newest'
          sortOptions = { createdAt: -1 };
      }
    }
    
    // Execute query
    const products = await Product.find(query)
      .sort(sortOptions)
      .populate('seller', 'name email')
      .limit(20);
    
    res.json({
      success: true,
      products,
      totalProducts: products.length
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch products' 
    });
  }
});

// Get seller's products (protected route)
router.get('/seller/products', ensureAuth, async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user.id })
      .populate('seller', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      products
    });
  } catch (error) {
    console.error('Error fetching seller products:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch seller products'
    });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('seller', 'name email');
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch product'
    });
  }
});

// Create new product (protected route)
router.post('/', ensureAuth, (req, res, next) => {
  console.log('📤 About to upload images...');
  upload.array('images', 5)(req, res, (err) => {
    if (err) {
      console.error('❌ Multer upload error:', err.message);
      console.error('Error type:', err.constructor.name);
      console.error('Full error:', err);
      return res.status(400).json({
        success: false,
        error: `Upload failed: ${err.message}`
      });
    }
    console.log('✅ Files uploaded to Cloudinary');
    next();
  });
}, async (req, res) => {
  try {
    console.log('📤 POST /products - Starting product upload');
    console.log('Raw request body:', req.body);
    console.log('Files received:', req.files ? req.files.length : 0);
    
    if (req.files) {
      req.files.forEach((file, index) => {
        console.log(`File ${index}:`, {
          fieldname: file.fieldname,
          originalname: file.originalname,
          path: file.path,
          size: file.size
        });
      });
    }
    
    // Try to get product data from either direct form fields or JSON
    let productData;
    
    // Check if data is in direct form fields
    if (req.body.name && req.body.price) {
      console.log('Using direct form data');
      productData = req.body;
    }
    // If not, try to parse from JSON (for backward compatibility)
    else if (req.body.product) {
      console.log('Trying to parse JSON data');
      try {
        productData = JSON.parse(req.body.product);
        console.log('Parsed product data:', productData);
      } catch (err) {
        console.error('Error parsing product data:', err);
        return res.status(400).json({
          success: false,
          error: 'Invalid product data format'
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        error: 'No product data provided'
      });
    }

    // Get the file paths of uploaded images
    const imagePaths = req.files ? req.files.map(file => file.path) : [];
    console.log('Image paths:', imagePaths);

    if (!productData.name || !productData.price || !productData.description || 
        !productData.category || !productData.condition || !productData.location) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required'
      });
    }

    // Create new product with all required fields
    const product = new Product({
      name: productData.name,
      price: parseFloat(productData.price),
      description: productData.description,
      category: productData.category,
      gender: productData.gender || 'unisex',
      condition: productData.condition,
      location: productData.location,
      seller: req.user.id,
      images: imagePaths
    });

    console.log('Creating product:', product);
    await product.save();
    
    res.status(201).json({
      success: true,
      product
    });
  } catch (error) {
    console.error('❌ Error creating product:', error);
    console.error('Error stack:', error.stack);
    console.error('Error message:', error.message);
    console.error('Full error:', JSON.stringify(error, null, 2));
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create product'
    });
  }
});

// Update product (protected route)
router.put('/:id', ensureAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    // Check if user owns the product
    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this product'
      });
    }
    
    Object.assign(product, req.body);
    await product.save();
    
    res.json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update product'
    });
  }
});

// Delete product (protected route)
router.delete('/:id', ensureAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    // Check if user owns the product
    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this product'
      });
    }
    
    await product.remove();
    
    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete product'
    });
  }
});

export default router;
