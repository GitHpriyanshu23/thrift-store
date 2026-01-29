import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  googleId: { type: String },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  profilePic: { type: String },
  role: { type: String, enum: ["buyer", "seller"], default: "buyer" },
  sellerInfo: {
    businessName: { type: String },
    businessAddress: { type: String },
    phoneNumber: { type: String },
    description: { type: String },
    approved: { type: Boolean, default: false },
    createdAt: { type: Date }
  },
  createdAt: { type: Date, default: Date.now }
},{ collection: "users" });

// Making the googleId index sparse ensures null values aren't indexed
UserSchema.index({ googleId: 1 }, { unique: true, sparse: true });

export default mongoose.model("User", UserSchema);
