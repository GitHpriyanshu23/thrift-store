import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Ensure environment variables are loaded from backend root (where npm start is executed)
// Use override: true to ensure values are loaded even if already set
dotenv.config({ path: path.join(process.cwd(), ".env"), override: true });

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    console.log('📊 Using existing MongoDB connection');
    return;
  }

  try {
    // Get MongoDB connection URI from environment variables
    const mongoURI = process.env.MONGO_URI;
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/8a03fbc8-c08c-41a0-9044-e312b1b9c96c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'db.js:17',message:'Checking MONGO_URI',data:{hasMongoURI:!!mongoURI,mongoURILength:mongoURI?.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    if (!mongoURI) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/8a03fbc8-c08c-41a0-9044-e312b1b9c96c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'db.js:22',message:'MONGO_URI missing - throwing error',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      throw new Error("MongoDB URI not found in environment variables. Check your .env file.");
    }
    
    console.log("📊 Connecting to MongoDB Atlas...");
    // Print the first part of the URI for debugging (hide credentials)
    const uriParts = mongoURI.split('@');
    if (uriParts.length > 1) {
      console.log(`URI format: mongodb+srv://****@${uriParts[1]}`);
    }
    
    mongoose.set('strictQuery', false);
    
    // Simplified connection options for troubleshooting
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      bufferCommands: true
    });
    
    isConnected = true;
    console.log("✅ MongoDB Atlas connected successfully");

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
      isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected successfully');
      isConnected = true;
    });

    return mongoose.connection;

  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/8a03fbc8-c08c-41a0-9044-e312b1b9c96c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'db.js:65',message:'MongoDB connection catch block',data:{error:error.message,errorCode:error.code,stack:error.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    console.error("❌ MongoDB connection error:", error.message);
    isConnected = false;
    // Don't try to reconnect automatically to avoid infinite loops
    throw error;
  }
};

export const getConnectionStatus = () => isConnected;

export default {
  connectDB,
  getConnectionStatus
};
