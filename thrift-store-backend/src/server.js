// CRITICAL: Load .env FIRST before any other imports that might also load dotenv
import dotenv from "dotenv";
import path from "path";
import { existsSync, readFileSync } from "fs";

// Load .env file from the backend root directory (where npm start is executed)
const envPath = path.join(process.cwd(), ".env");
let result = dotenv.config({ path: envPath, override: true });

// If dotenv fails due to permissions, try reading file directly and parsing manually
if (result.error && result.error.code === 'EPERM') {
  try {
    const envContent = readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim();
          process.env[key.trim()] = value;
        }
      }
    }
    console.log("✅ Loaded .env file manually (bypassed permission issue)");
    result = { error: null, parsed: true };
  } catch (manualError) {
    console.error("❌ Failed to load .env manually:", manualError.message);
  }
}

// Verify .env loaded
if (result.error && result.error.code !== 'EPERM') {
  console.error("❌ Error loading .env file:", result.error.message);
}
if (!process.env.MONGO_URI) {
  console.error("❌ WARNING: MONGO_URI not found after loading .env");
  console.error("   Env path:", envPath);
  console.error("   CWD:", process.cwd());
  console.error("   File exists:", existsSync(envPath));
}

// #region agent log
fetch('http://127.0.0.1:7242/ingest/8a03fbc8-c08c-41a0-9044-e312b1b9c96c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server.js:18',message:'dotenv.config result',data:{error:result.error?.message,parsed:!!result.parsed,hasMongoURI:!!process.env.MONGO_URI,mongoURIPreview:process.env.MONGO_URI?.substring(0,30),envPath,cwd:process.cwd()},timestamp:Date.now(),sessionId:'debug-session',runId:'run5',hypothesisId:'A'})}).catch(()=>{});
// #endregion

import express from "express";
import session from "express-session";

// #region agent log
fetch('http://127.0.0.1:7242/ingest/8a03fbc8-c08c-41a0-9044-e312b1b9c96c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server.js:11',message:'Before passport import',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
// #endregion

import passport from "./config/auth.js";

// #region agent log
fetch('http://127.0.0.1:7242/ingest/8a03fbc8-c08c-41a0-9044-e312b1b9c96c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server.js:15',message:'Passport imported successfully',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
// #endregion

import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.js";
import cors from "cors";
import mongoose from "mongoose";

const app = express();

// In-memory data store as fallback when MongoDB is unavailable
const inMemoryDB = {
  users: [
    {
      _id: "1",
      name: "Demo User",
      email: "demo@example.com",
      password: "$2b$10$Mjb3ZL5jfVFYt.Jr6G7kiu8ykcYT5oA6VGfUxdQORpcMmeFGbSOWC", // "password"
      role: "buyer",
      createdAt: new Date()
    }
  ],
  products: [],
  orders: [],
  cart: []
};

// Middleware setup
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session configuration
app.use(session({
  secret: process.env.JWT_SECRET || "your-secret-key",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === "production" }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Serve uploads directory as static files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Fallback auth routes when MongoDB is unavailable
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  
  // For testing, allow any credentials in dev mode
  if (process.env.NODE_ENV !== "production") {
    return res.json({
      success: true,
      token: "demo-token-for-testing",
      user: {
        _id: "1",
        name: "Demo User",
        email: email || "demo@example.com",
        role: "buyer"
      }
    });
  }
  
  // In production, check against in-memory store
  const user = inMemoryDB.users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }
  
  return res.json({
    success: true,
    token: "demo-token-for-testing",
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

// Google OAuth routes - register immediately (don't require MongoDB for initiation)
app.get("/api/auth/google", (req, res, next) => {
  console.log("🔍 Starting Google OAuth flow...");
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false
  })(req, res, next);
});

// Load full auth routes asynchronously (for login, register, etc.)
// These will be available after MongoDB connects
import("./routes/authRoutes.js").then(module => {
  app.use("/api/auth", module.default);
  console.log("✅ Full auth routes loaded");
}).catch(err => {
  console.error("❌ Failed to load full auth routes:", err.message);
});

// Basic routes that don't require database
app.get("/test", (req, res) => {
  res.json({ message: "API is working" });
});

app.get("/", (req, res) => {
  res.json({ message: "Welcome to Thrift Store API" });
});

// MongoDB status endpoint
app.get("/api/db-status", (req, res) => {
  const status = mongoose.connection.readyState;
  const statusText = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting"
  }[status] || "unknown";
  
  res.json({
    status: statusText,
    code: status,
    mongoURI: process.env.MONGO_URI ? 
      `mongodb+srv://****@${process.env.MONGO_URI.split('@')[1] || "not-configured"}` : 
      "not-configured",
    fallbackActive: status !== 1
  });
});

// 📌 Start Server
// Use 5001 instead of 5000 to avoid conflict with macOS ControlCenter (AirPlay)
const PORT = process.env.PORT || 5001;

// #region agent log
fetch('http://127.0.0.1:7242/ingest/8a03fbc8-c08c-41a0-9044-e312b1b9c96c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server.js:125',message:'Before port binding',data:{port:PORT,envPort:process.env.PORT},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
// #endregion

app.listen(PORT, () => {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/8a03fbc8-c08c-41a0-9044-e312b1b9c96c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server.js:130',message:'Port binding successful',data:{port:PORT},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Server URL: http://localhost:${PORT}`);
  console.log(`🔐 Google callback URL: http://localhost:${PORT}/api/auth/google/callback`);
}).on('error', (err) => {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/8a03fbc8-c08c-41a0-9044-e312b1b9c96c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server.js:136',message:'Port binding error',data:{port:PORT,errorCode:err.code,errorMessage:err.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  console.error('❌ Server startup error:', err);
});

// Attempt to connect to MongoDB
console.log("Attempting to connect to MongoDB...");

// #region agent log
fetch('http://127.0.0.1:7242/ingest/8a03fbc8-c08c-41a0-9044-e312b1b9c96c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server.js:142',message:'Before MongoDB connection',data:{hasMongoURI:!!process.env.MONGO_URI},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
// #endregion

connectDB()
  .then(() => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/8a03fbc8-c08c-41a0-9044-e312b1b9c96c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server.js:146',message:'MongoDB connection successful',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    console.log("MongoDB connected successfully - loading routes");
    
    // Import models first to ensure they're registered before route imports
    import("./models/User.js").then(() => {
      console.log("✅ User model imported");
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/8a03fbc8-c08c-41a0-9044-e312b1b9c96c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server.js:150',message:'User model imported',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      return import("./models/Product.js");
    }).then(() => {
      console.log("✅ Product model imported");
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/8a03fbc8-c08c-41a0-9044-e312b1b9c96c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server.js:152',message:'Product model imported',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      // Import routes after models and successful DB connection
      return import("./routes/productRoutes.js");
    }).then(module => {
      app.use("/api/products", module.default);
      console.log("Product routes loaded");
      return import("./routes/userRoutes.js");
    }).then(module => {
      app.use("/api/users", module.default);
      console.log("User routes loaded");
      // Auth routes are already loaded immediately above, skip duplicate registration
      console.log("Auth routes already loaded (registered immediately)");
      return import("./routes/orderRoutes.js");
    }).then(module => {
      app.use("/api/orders", module.default);
      console.log("Order routes loaded");
      return import("./routes/cartRoutes.js");
    }).then(module => {
      app.use("/api/cart", module.default);
      console.log("Cart routes loaded");
      return import("./routes/razorpayWebhook.js");
    }).then(module => {
      app.use("/api/razorpay", module.default);
      console.log("Razorpay webhook route loaded");
      
      // Print all registered routes
      console.log("All registered routes:");
      app._router.stack
        .filter(r => r.route && r.route.path)
        .forEach(r => {
          const methods = Object.keys(r.route.methods).map(m => m.toUpperCase());
          console.log(`✅ ${methods.join(', ')} -> ${r.route.path}`);
        });
    }).catch(err => {
      console.error("❌ Error loading routes:", err.message);
      console.error(err.stack);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/8a03fbc8-c08c-41a0-9044-e312b1b9c96c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server.js:199',message:'Routes loading error',data:{error:err.message,stack:err.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
    });
  })
  .catch(err => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/8a03fbc8-c08c-41a0-9044-e312b1b9c96c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server.js:207',message:'MongoDB connection failed',data:{error:err.message,errorCode:err.code,stack:err.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    console.error("Failed to connect to MongoDB. Routes requiring database access will not work.");
    console.error("Error details:", err.message);
  });

// #region agent log
process.on('uncaughtException', (err) => {
  fetch('http://127.0.0.1:7242/ingest/8a03fbc8-c08c-41a0-9044-e312b1b9c96c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server.js:214',message:'Uncaught exception',data:{error:err.message,errorCode:err.code,stack:err.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
});

process.on('unhandledRejection', (reason, promise) => {
  fetch('http://127.0.0.1:7242/ingest/8a03fbc8-c08c-41a0-9044-e312b1b9c96c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server.js:218',message:'Unhandled rejection',data:{reason:reason?.message||String(reason),stack:reason?.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
});
// #endregion
