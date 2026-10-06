import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    // Optional: local-auth users have this, Google-only users don't.
    password: { type: String, required: false },
    // Google OAuth identity
    googleId: { type: String, unique: true, sparse: true },
    picture: { type: String },
  },
  { timestamps: true }
);

const userModel = mongoose.models.User || mongoose.model("User", userSchema);

export default userModel;