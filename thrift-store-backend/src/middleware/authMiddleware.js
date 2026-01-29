import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

// Auth middleware that checks if the user is authenticated
export const ensureAuth = (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            console.log('❌ No authorization header provided');
            return res.status(401).json({ success: false, message: 'No token, authorization denied' });
        }
        
        // Check if bearer token
        if (!authHeader.startsWith('Bearer ')) {
            console.log('❌ Invalid authorization format, must be Bearer token');
            return res.status(401).json({ success: false, message: 'Invalid token format' });
        }
        
        // Get token
        const token = authHeader.split(' ')[1];
        
        if (!token) {
            console.log('❌ Token is empty');
            return res.status(401).json({ success: false, message: 'Token is empty' });
        }
        
        console.log('🔑 Auth middleware: verifying token...');
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        // Log token payload for debugging
        console.log('🔍 Token payload:', JSON.stringify(decoded, null, 2));
        
        // Add user from payload
        req.user = decoded;
        
        // Ensure backward compatibility with various ID formats
        if (!req.user.userId && req.user.id) {
            req.user.userId = req.user.id;
            console.log('🔄 Added userId from id:', req.user.userId);
        } else if (!req.user.id && req.user.userId) {
            req.user.id = req.user.userId;
            console.log('🔄 Added id from userId:', req.user.id);
        }
        
        if (!req.user.userId && !req.user.id) {
            console.log('⚠️ No user ID found in token!');
            console.log('📝 Full token payload:', JSON.stringify(decoded, null, 2));
            return res.status(401).json({ success: false, message: 'Invalid token format - missing user ID' });
        }
        
        console.log('✅ Token verified, user ID:', req.user.userId || req.user.id);
        console.log('👤 User email:', req.user.email);
        console.log('👑 User role:', req.user.role);
        
        next();
    } catch (error) {
        console.error('❌ Token verification failed:', error.message);
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Token expired' });
        }
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ success: false, message: 'Invalid token' });
        }
        
        res.status(401).json({ success: false, message: 'Not authorized' });
    }
};

export const ensureSeller = (req, res, next) => {
    if (req.user && req.user.role === 'seller') {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Access denied - Seller privileges required' });
    }
};

export const ensureAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Access denied - Admin privileges required' });
    }
};
