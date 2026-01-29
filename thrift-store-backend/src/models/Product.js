import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
    enum: ['clothing', 'electronics', 'home', 'books', 'accessories', 'other'],
    trim: true
  },
  gender: {
    type: String,
    enum: ['men', 'women', 'unisex'],
    default: 'unisex',
    trim: true
  },
  condition: {
    type: String,
    required: [true, 'Product condition is required'],
    enum: ['new', 'like-new', 'good', 'fair', 'poor'],
    trim: true
  },
  images: [{
    type: String,
    required: [true, 'At least one image is required']
  }],
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Seller information is required']
  },
  location: {
    type: String,
    required: [true, 'Product location is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['available', 'sold', 'reserved'],
    default: 'available'
  },
  views: {
    type: Number,
    default: 0
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Index for text search
productSchema.index({ name: 'text', description: 'text' });

// Index for category and status
productSchema.index({ category: 1, status: 1 });

// Index for price range queries
productSchema.index({ price: 1 });

// Index for seller queries
productSchema.index({ seller: 1 });

const Product = mongoose.model('Product', productSchema);

export default Product;
