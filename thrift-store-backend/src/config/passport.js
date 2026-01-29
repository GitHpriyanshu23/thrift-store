import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import User from '../models/User.js';
import { connectDB, getConnectionStatus } from './db.js';

dotenv.config();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const CALLBACK_URL = 'http://localhost:5000/auth/google/callback';

console.log('🔐 Google OAuth Configuration:');
console.log(`- Client ID: ${GOOGLE_CLIENT_ID ? '✅ Set (' + GOOGLE_CLIENT_ID.substring(0, 10) + '...)' : '❌ Missing'}`);
console.log(`- Client Secret: ${GOOGLE_CLIENT_SECRET ? '✅ Set (' + GOOGLE_CLIENT_SECRET.substring(0, 5) + '...)' : '❌ Missing'}`);
console.log(`- Callback URL: ${CALLBACK_URL}`);

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: CALLBACK_URL,
    proxy: true,
    timeout: 60000,
    userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo',
    passReqToCallback: true
  },
  async function(req, accessToken, refreshToken, profile, done) {
    try {
      console.log('📣 Google OAuth callback received!');
      
      // Ensure MongoDB is connected
      if (!getConnectionStatus()) {
        console.log('⌛ Waiting for MongoDB connection...');
        await connectDB();
      }

      if (!profile.emails || !profile.emails[0].value) {
        console.log('❌ No email found in profile');
        return done(null, false, { message: 'No email found in Google profile' });
      }

      const userEmail = profile.emails[0].value;
      console.log('✅ User profile extracted successfully:', userEmail);

      // Look for existing user with retry logic
      console.log('🔍 Looking for existing Google user:', userEmail);
      let existingUser = null;
      let retries = 3;
      
      while (retries > 0) {
        try {
          existingUser = await User.findOne({ email: userEmail }).exec();
          break;
        } catch (err) {
          console.log(`Retry attempt ${4 - retries} failed:`, err.message);
          retries--;
          if (retries === 0) throw err;
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      if (existingUser) {
        console.log('👤 Auth result: Success User found');
        return done(null, existingUser);
      }

      // Create new user if none exists
      console.log('👤 Creating new user for:', userEmail);
      const newUser = new User({
        email: userEmail,
        name: profile.displayName,
        googleId: profile.id,
        avatar: profile.photos?.[0]?.value,
        role: 'buyer' // Default role
      });

      await newUser.save();
      console.log('✅ New user created successfully');
      return done(null, newUser);

    } catch (error) {
      console.log('❌ Error in Google callback:', error);
      return done(error, false);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    // Ensure MongoDB is connected
    if (!getConnectionStatus()) {
      await connectDB();
    }
    const user = await User.findById(id).exec();
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
