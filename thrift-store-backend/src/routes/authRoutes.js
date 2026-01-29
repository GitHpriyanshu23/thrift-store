import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import '../models/User.js'; // Import User model

const router = express.Router();

// Get User model
const User = mongoose.model('User');
console.log("✅ User model loaded in auth routes");

// 👤 Register a new user
router.post("/register", async (req, res) => {
    try {
        console.log("📝 Registration attempt:", req.body.email);
        
        // Check if user already exists
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: "User already exists with this email" 
            });
        }
        
        // Validate input
        if (!req.body.password || req.body.password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters long"
            });
        }
        
        if (!req.body.name) {
            return res.status(400).json({
                success: false,
                message: "Name is required"
            });
        }
        
        // Create new user WITHOUT googleId (don't set it at all for non-Google users)
        const newUser = new User({
            name: req.body.name,
            email: req.body.email,
            password: await bcrypt.hash(req.body.password, 10),
            role: "buyer", // Default role
            createdAt: new Date()
            // Omit googleId completely for non-Google users
        });
        
        // Save user to database
        await newUser.save();
        console.log("✅ User created:", newUser.email);
        
        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: newUser._id, 
                id: newUser._id, 
                email: newUser.email, 
                name: newUser.name,
                role: newUser.role 
            },
            process.env.JWT_SECRET || "your-secret-key",
            { expiresIn: "7d" }
        );
        
        res.status(201).json({
            success: true,
            token,
            user: {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });
    } catch (error) {
        console.error("❌ Registration error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Registration failed", 
            error: error.message,
            details: error.code === 11000 ? "Email or ID already in use" : error.message
        });
    }
});

// 🔑 Login user
router.post("/login", async (req, res) => {
    try {
        console.log("🔑 Login attempt:", req.body.email);
        
        // Find user by email
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }
        
        // Check password
        const isPasswordValid = user.password ? await bcrypt.compare(req.body.password, user.password) : false;
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }
        
        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET || "your-secret-key",
            { expiresIn: "7d" }
        );
        
        console.log("✅ User logged in:", user.email);
        return res.json({
            success: true,
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error("❌ Login error:", error);
        res.status(500).json({ success: false, message: "Login failed", error: error.message });
    }
});

// 🔍 Get current user profile
router.get("/me", async (req, res) => {
    try {
        // Log the authorization header for debugging
        console.log("🔑 Auth header:", req.headers.authorization ? "Present" : "Missing");
        
        // If this endpoint is not protected by the ensureAuth middleware, extract and verify the token manually
        if (!req.user && req.headers.authorization) {
            const token = req.headers.authorization.split(' ')[1];
            
            if (token) {
                try {
                    console.log("🔄 Manual token verification for /me endpoint");
                    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
                    req.user = decoded;
                    
                    // Log success
                    console.log("✅ Manual token verification successful");
                    console.log("🔍 User payload:", JSON.stringify(decoded, null, 2));
                } catch (tokenError) {
                    console.error("❌ Manual token verification failed:", tokenError.message);
                }
            }
        }
        
        console.log("🔍 Request user:", req.user ? "Present" : "Undefined");
        
        // Check if user is authenticated
        if (!req.user) {
            console.log("❌ No user found in request - token may be missing or invalid");
            return res.status(401).json({ 
                success: false, 
                message: "Not authenticated - please login"
            });
        }
        
        // Check both userId and id fields for flexibility
        const userId = req.user.userId || req.user.id;
        
        if (!userId) {
            console.log("❌ No user ID found in token");
            return res.status(401).json({ 
                success: false, 
                message: "Invalid token - no user ID"
            });
        }
        
        console.log("🔍 Looking up user with ID:", userId);
        
        // Get user from database
        const user = await User.findById(userId);
        if (!user) {
            console.log("❌ User not found in database with ID:", userId);
            return res.status(404).json({ success: false, message: "User not found" });
        }
        
        console.log("✅ User found:", user.email);
        
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
        console.error("❌ Error fetching user profile:", error);
        res.status(500).json({ success: false, message: "Failed to fetch user profile", error: error.message });
    }
});

// 🔐 Google OAuth - Initiate authentication
router.get("/google", (req, res, next) => {
    console.log("🔍 Starting Google OAuth flow...");
    passport.authenticate("google", {
        scope: ["profile", "email"],
        session: false
    })(req, res, next);
});

// 🔐 Google OAuth - Callback
router.get(
    "/google/callback",
    (req, res, next) => {
        console.log("🔄 Google callback received");
        passport.authenticate("google", { session: false }, async (err, googleProfile, info) => {
            console.log("👤 Auth result:", err ? "Error" : "Success", googleProfile ? "User found" : "No user");
            
            if (err) {
                console.error("❌ Google auth error:", err);
                return res.redirect(`${process.env.FRONTEND_URL || "http://localhost:3000"}/login?error=${encodeURIComponent(err.message)}`);
            }
            
            if (!googleProfile) {
                console.error("❌ No user returned from Google auth");
                return res.redirect(`${process.env.FRONTEND_URL || "http://localhost:3000"}/login?error=Authentication failed`);
            }
            
            try {
                console.log("🔍 Looking for existing Google user:", googleProfile.email);
                // Find or create user in database
                let user = await User.findOne({ 
                    $or: [
                        { googleId: googleProfile.googleId },
                        { email: googleProfile.email }
                    ] 
                });
                
                if (!user) {
                    // Create new user from Google profile
                    user = new User({
                        name: googleProfile.name,
                        email: googleProfile.email,
                        googleId: googleProfile.googleId,
                        profilePicture: googleProfile.picture,
                        role: "buyer" // Default role
                    });
                    await user.save();
                    console.log("📝 New Google user created:", user.email);
                } else if (!user.googleId) {
                    // If user exists with same email but no googleId, update the user
                    user.googleId = googleProfile.googleId;
                    user.profilePicture = user.profilePicture || googleProfile.picture;
                    await user.save();
                    console.log("🔄 Updated existing user with Google ID:", user.email);
                } else {
                    console.log("✅ Existing Google user found:", user.email);
                }
                
                // Generate JWT token - Make sure the structure matches what the middleware expects
                console.log("🔑 Generating token for user:", user.email);
                const token = jwt.sign(
                    { 
                        userId: user._id,
                        id: user._id, // Include both formats for backwards compatibility
                        email: user.email, 
                        name: user.name, // Include name for direct display in frontend
                        role: user.role 
                    },
                    process.env.JWT_SECRET || "your-secret-key",
                    { expiresIn: "7d" }
                );
                
                // Redirect back to frontend with token
                console.log("➡️ Redirecting to frontend with token");
                res.redirect(`${process.env.FRONTEND_URL || "http://localhost:3000"}/login?token=${token}`);
            } catch (error) {
                console.error("❌ Error in Google callback:", error);
                res.redirect(`${process.env.FRONTEND_URL || "http://localhost:3000"}/login?error=${encodeURIComponent(error.message)}`);
            }
        })(req, res, next);
    }
);

export default router;
