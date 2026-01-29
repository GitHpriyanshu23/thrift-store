import mongoose from 'mongoose';
import Product from '../models/Product.js';
import dotenv from 'dotenv';

dotenv.config();

const addGenderToProducts = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/thrift-store');
    console.log('Connected to MongoDB');

    // Update all products that don't have a gender field
    const result = await Product.updateMany(
      { gender: { $exists: false } },
      { $set: { gender: 'unisex' } }
    );

    console.log(`Updated ${result.modifiedCount} products with gender field set to 'unisex'`);

    // Show all products with their gender
    const allProducts = await Product.find({}, 'name gender');
    console.log('\nAll products with gender:');
    allProducts.forEach(product => {
      console.log(`- ${product.name}: ${product.gender}`);
    });

    console.log('\nGender field successfully added to all products!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating products:', error);
    process.exit(1);
  }
};

addGenderToProducts();
