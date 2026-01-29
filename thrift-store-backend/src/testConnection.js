import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

const testConnection = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    
    if (!mongoURI) {
      throw new Error("MongoDB URI not found in environment variables. Check your .env file.");
    }
    
    console.log("📊 Testing connection to MongoDB Atlas...");
    console.log(`Connection string: ${mongoURI.substring(0, 20)}...`);
    
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000
    });
    
    console.log("✅ MongoDB Atlas connection test successful");
    
    // Create a simple test collection and document
    const Test = mongoose.model('Test', new mongoose.Schema({ name: String, date: Date }));
    
    const testDoc = new Test({
      name: 'Connection Test',
      date: new Date()
    });
    
    await testDoc.save();
    console.log("✅ Created test document successfully");
    
    // Find the test document
    const foundDoc = await Test.findOne({ name: 'Connection Test' });
    console.log("✅ Found test document:", foundDoc);
    
    await mongoose.connection.close();
    console.log("✅ Connection closed successfully");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ MongoDB connection test failed:", error.message);
    process.exit(1);
  }
};

testConnection(); 