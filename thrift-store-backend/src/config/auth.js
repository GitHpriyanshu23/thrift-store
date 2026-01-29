import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import dotenv from 'dotenv';
import path from 'path';

// Ensure environment variables are loaded from backend root (where npm start is executed)
// Use override: true to ensure values are loaded even if already set
dotenv.config({ path: path.join(process.cwd(), ".env"), override: true });

// Google OAuth credentials from environment variables
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || "http://localhost:5001/api/auth/google/callback";

console.log("🔐 Google OAuth Configuration:");
console.log(`- Client ID: ${GOOGLE_CLIENT_ID ? "✅ Set (" + GOOGLE_CLIENT_ID.substring(0, 10) + "...)" : "❌ Missing"}`);
console.log(`- Client Secret: ${GOOGLE_CLIENT_SECRET ? "✅ Set (" + GOOGLE_CLIENT_SECRET.substring(0, 5) + "...)" : "❌ Missing"}`);
console.log(`- Callback URL: ${CALLBACK_URL}`);

// User model - will be imported once we create it
// import User from '../models/userModel.js';

// Google OAuth Strategy
if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  console.log("🚀 Configuring Google OAuth strategy with real credentials");
  
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: CALLBACK_URL,
        proxy: true
      },
      (accessToken, refreshToken, profile, done) => {
        try {
          console.log("📣 Google OAuth callback received!");
          console.log(`User profile:`, JSON.stringify(profile, null, 2));
          
          // Extract email
          const email = profile.emails && profile.emails.length ? profile.emails[0].value : null;
          if (!email) {
            console.error("❌ No email found in Google profile");
            return done(new Error("No email found in Google profile"), null);
          }
          
          // Extract profile picture
          const picture = profile.photos && profile.photos.length ? profile.photos[0].value : null;
          
          // Create user object
          const user = {
            name: profile.displayName,
            email: email,
            googleId: profile.id,
            picture: picture,
            role: "buyer"  // Default role
          };
          
          console.log("✅ User profile extracted successfully:", user.email);
          return done(null, user);
        } catch (error) {
          console.error("❌ Error in Google OAuth callback:", error);
          return done(error, false);
        }
      }
    )
  );
} else {
  console.warn("⚠️ Google OAuth credentials not found in environment variables.");
  console.warn("⚠️ Using mock Google OAuth for development.");
  
  // Mock Google strategy for development without real credentials
  passport.use(
    new GoogleStrategy(
      {
        clientID: "mock-client-id",
        clientSecret: "mock-client-secret",
        callbackURL: CALLBACK_URL
      },
      (accessToken, refreshToken, profile, done) => {
        console.log("📣 MOCK Google OAuth callback received");
        
        // Create a mock user
        const mockUser = {
          name: "Demo User",
          email: "demo.user@example.com",
          googleId: "12345",
          picture: "https://via.placeholder.com/150",
          role: "buyer"
        };
        
        console.log("✅ Mock user created:", mockUser.email);
        return done(null, mockUser);
      }
    )
  );
}

// JWT Strategy for API authentication
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'your-secret-key'
};

passport.use(
  new JwtStrategy(jwtOptions, async (jwt_payload, done) => {
    try {
      // This will be implemented once we have the User model
      // const user = await User.findById(jwt_payload.id);
      const user = { id: jwt_payload.id }; // Placeholder

      if (user) {
        return done(null, user);
      }
      return done(null, false);
    } catch (error) {
      return done(error, false);
    }
  })
);

// Serialize user for session
passport.serializeUser((user, done) => {
  console.log("📦 Serializing user:", user.email);
  done(null, user);
});

// Deserialize user from session
passport.deserializeUser((user, done) => {
  console.log("📂 Deserializing user:", user.email);
  done(null, user);
});

console.log('Google OAuth configuration loaded (real version)');

// This is a placeholder that doesn't do anything but prevents import errors
export default passport;
