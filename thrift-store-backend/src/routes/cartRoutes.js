import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// Sample cart data
let cart = {
  items: [],
  totalItems: 0,
  totalPrice: 0
};

// Get cart
router.get('/', (req, res) => {
  try {
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add item to cart
router.post('/', async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    
    if (!productId || !quantity) {
      return res.status(400).json({ message: 'productId and quantity are required' });
    }
    
    // Get product from database using mongoose
    let product;
    try {
      const db = mongoose.connection;
      product = await db.collection('products').findOne({ _id: new mongoose.Types.ObjectId(productId) });
    } catch (e) {
      console.error('Error fetching product:', e);
      product = null;
    }
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Extract product data for cart
    const cartProduct = {
      _id: product._id.toString(),
      name: product.name,
      price: product.price,
      images: product.images || [],
      category: product.category,
      condition: product.condition
    };
    
    // Check if item exists in cart
    const existingItemIndex = cart.items.findIndex(item => item.product._id === productId);
    
    if (existingItemIndex >= 0) {
      // Update quantity if item exists
      cart.items[existingItemIndex].quantity += quantity;
      cart.items[existingItemIndex].price = cartProduct.price * cart.items[existingItemIndex].quantity;
    } else {
      // Add new item if it doesn't exist
      cart.items.push({
        product: cartProduct,
        quantity,
        price: cartProduct.price * quantity
      });
    }
    
    // Update cart totals
    cart.totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
    cart.totalPrice = cart.items.reduce((total, item) => total + item.price, 0);
    
    res.status(201).json({ success: true, cart });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update cart item
router.put('/:productId', (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    
    // Find item in cart
    const itemIndex = cart.items.findIndex(item => item.product._id === productId);
    
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }
    
    // Update quantity and price
    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].price = cart.items[itemIndex].product.price * quantity;
    
    // Update cart totals
    cart.totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
    cart.totalPrice = cart.items.reduce((total, item) => total + item.price, 0);
    
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove item from cart
router.delete('/:productId', (req, res) => {
  try {
    const { productId } = req.params;
    
    // Remove item from cart
    cart.items = cart.items.filter(item => item.product._id !== productId);
    
    // Update cart totals
    cart.totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
    cart.totalPrice = cart.items.reduce((total, item) => total + item.price, 0);
    
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clear cart
router.delete('/', (req, res) => {
  try {
    // Reset cart
    cart = {
      items: [],
      totalItems: 0,
      totalPrice: 0
    };
    
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
