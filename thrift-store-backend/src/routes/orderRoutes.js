import express from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import { ensureAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all orders for authenticated user
router.get('/', ensureAuth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate('user', 'name email');
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get order by ID
router.get('/:id', ensureAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify user owns this order
    if (order.user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new order
router.post('/', ensureAuth, async (req, res) => {
  try {
    const { items = [], shippingAddress = {}, paymentMethod = 'cod', totalAmount } = req.body || {};

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'No items provided for order' });
    }

    if (!shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.line1 || !shippingAddress.city || !shippingAddress.state || !shippingAddress.postalCode) {
      return res.status(400).json({ message: 'Incomplete shipping address' });
    }

    const computedTotal = items.reduce((sum, i) => sum + (i.price || (i.product?.price || 0) * (i.quantity || 1)), 0);

    const newOrder = new Order({
      user: req.user.id,
      items: items.map(i => ({
        product: {
          _id: i.product?._id || 'unknown',
          name: i.product?.name || 'Unknown',
          price: i.product?.price || 0,
          images: i.product?.images || [],
        },
        quantity: i.quantity || 1,
        price: i.price || ((i.product?.price || 0) * (i.quantity || 1))
      })),
      totalAmount: typeof totalAmount === 'number' ? totalAmount : Number(computedTotal.toFixed(2)),
      status: 'pending',
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
      paymentMethod,
      shippingAddress,
    });

    await newOrder.save();
    res.status(201).json({ success: true, order: newOrder });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: error.message });
  }
});

// Cancel order
router.put('/:id/cancel', ensureAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify user owns this order
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to cancel this order' });
    }
    
    // Only allow cancellation if order is pending or processing
    if (!['pending', 'processing'].includes(order.status)) {
      return res.status(400).json({ message: 'Cannot cancel order at this stage' });
    }
    
    order.status = 'cancelled';
    await order.save();
    
    res.json(order);
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update payment status
router.put('/:id/payment', ensureAuth, async (req, res) => {
  try {
    const { paymentStatus, transactionId } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify user owns this order
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }
    
    order.paymentStatus = paymentStatus;
    if (transactionId) {
      order.paymentInfo = { transactionId };
    }
    
    await order.save();
    res.json(order);
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
