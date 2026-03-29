import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },

  otp: { type: String, required: true },

  purpose: {
    type: String,
    enum: ["register", "login", "reset"],
    required: true,
  },

  createdAt: { type: Date, default: Date.now },

  expiresAt: { type: Date, required: true },
});

/* ⏳ Auto delete expired OTP */
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("Otp", otpSchema);