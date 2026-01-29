import express from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import '../models/User.js'; // Import the User model file first to ensure it's registered
import { ensureAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get User model after ensuring it's registered
const User = mongoose.model('User');

// Get user profile
router.get('/profile', ensureAuth, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture || user.profilePic,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user profile', error: error.message });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const allowedUpdates = ['name', 'profilePicture'];
    const updates = Object.keys(req.body)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});
    
    const user = await User.findByIdAndUpdate(
      req.user.userId || req.user.id,
      updates,
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePic
      }
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update user to seller
router.put('/become-seller', ensureAuth, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const User = mongoose.model('User');
    
    // Find and update user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Update role to seller
    user.role = 'seller';
    
    // Initialize seller info if not already there
    if (!user.sellerInfo) {
      user.sellerInfo = {
        businessName: '',
        businessAddress: '',
        phoneNumber: '',
        description: '',
        approved: true, // Auto-approve for now
        createdAt: new Date()
      };
    }
    
    await user.save();
    
    console.log(`User ${user.email} has been upgraded to seller`);
    
    res.json({
      success: true,
      message: 'Your account has been upgraded to seller',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error upgrading to seller:', error);
    res.status(500).json({ success: false, message: 'Failed to upgrade to seller', error: error.message });
  }
});

export default router;