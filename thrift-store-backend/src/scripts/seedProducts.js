import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const createTestSeller = async () => {
  try {
    // Check if test seller already exists
    let seller = await User.findOne({ email: 'seller@test.com' });
    
    if (!seller) {
      // Create a new test seller
      const hashedPassword = await bcrypt.hash('password123', 10);
      seller = await User.create({
        name: 'Test Seller',
        email: 'seller@test.com',
        password: hashedPassword,
        role: 'seller',
        location: 'Test City, ST'
      });
      console.log('Created test seller:', seller._id);
    } else {
      console.log('Using existing test seller:', seller._id);
    }
    
    return seller._id;
  } catch (error) {
    console.error('Error creating test seller:', error);
    throw error;
  }
};

const sampleProducts = [
  {
    name: 'Vintage Denim Jacket',
    description: 'Classic Levi\'s denim jacket in excellent condition. Size M.',
    price: 45.99,
    category: 'clothing',
    condition: 'good',
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
    ],
    location: 'New York, NY',
    status: 'available'
  },
  {
    name: 'Classic Leather Boots',
    description: 'Timeless leather boots in great condition. Size 9.',
    price: 79.99,
    category: 'clothing',
    condition: 'like-new',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
    ],
    location: 'Los Angeles, CA',
    status: 'available'
  },
  {
    name: 'Designer Handbag',
    description: 'Authentic designer handbag in perfect condition.',
    price: 199.99,
    category: 'accessories',
    condition: 'like-new',
    images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
    ],
    location: 'Chicago, IL',
    status: 'available'
  },
  {
    name: 'Vintage Record Player',
    description: 'Classic turntable in working condition. Includes needle and dust cover.',
    price: 129.99,
    category: 'electronics',
    condition: 'good',
    images: [
      'https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
    ],
    location: 'San Francisco, CA',
    status: 'available'
  },
  {
    name: 'Antique Wooden Chair',
    description: 'Beautiful handcrafted wooden chair with intricate details.',
    price: 89.99,
    category: 'home',
    condition: 'good',
    images: [
      'https://images.unsplash.com/photo-1503602642455-232996c7f53e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
    ],
    location: 'Boston, MA',
    status: 'available'
  },
  {
    name: 'First Edition Book Collection',
    description: 'Set of classic first edition books in excellent condition.',
    price: 299.99,
    category: 'books',
    condition: 'good',
    images: [
      'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
    ],
    location: 'Seattle, WA',
    status: 'available'
  }
];

const seedProducts = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create or get test seller
    const sellerId = await createTestSeller();
    
    // Add seller ID to all products
    const productsWithSeller = sampleProducts.map(product => ({
      ...product,
      seller: sellerId
    }));

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert sample products
    const products = await Product.insertMany(productsWithSeller);
    console.log(`Successfully seeded ${products.length} products`);

    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
};

seedProducts(); 