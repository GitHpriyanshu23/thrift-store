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
    name: 'Tshirt',
    description: 'Quality cotton t-shirt in perfect condition.',
    price: 299,
    category: 'clothing',
    gender: 'men',
    condition: 'new',
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
    ],
    location: 'Mumbai, Maharashtra',
    status: 'available'
  },
  {
    name: 'Tshirt',
    description: 'Comfortable casual t-shirt, like new condition.',
    price: 399,
    category: 'clothing',
    gender: 'men',
    condition: 'new',
    images: [
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3dd1f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
    ],
    location: 'Delhi, Delhi',
    status: 'available'
  },
  {
    name: 'tshirt',
    description: 'Premium quality tshirt, lightly worn.',
    price: 499,
    category: 'clothing',
    gender: 'men',
    condition: 'like-new',
    images: [
      'https://images.unsplash.com/photo-1556821840-108801c026d6?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
    ],
    location: 'Bangalore, Karnataka',
    status: 'available'
  },
  {
    name: 'tshirt',
    description: 'Casual style tshirt in good condition.',
    price: 299,
    category: 'clothing',
    gender: 'women',
    condition: 'new',
    images: [
      'https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
    ],
    location: 'Pune, Maharashtra',
    status: 'available'
  },
  {
    name: 'Formal Trouser',
    description: 'Professional formal trouser, excellent condition.',
    price: 599,
    category: 'clothing',
    gender: 'men',
    condition: 'new',
    images: [
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
    ],
    location: 'Hyderabad, Telangana',
    status: 'available'
  },
  {
    name: 'tshirt',
    description: 'Stylish womens tshirt, like new.',
    price: 399,
    category: 'clothing',
    gender: 'women',
    condition: 'like-new',
    images: [
      'https://images.unsplash.com/photo-1502716917149-41a3a2d59a06?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
    ],
    location: 'Ahmedabad, Gujarat',
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