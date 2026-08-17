import mongoose from 'mongoose';

// Holds an email address through the pre-signup OTP dance before any User
// document exists. `expiresAt` bounds the whole record's lifetime (covers
// both "never entered the OTP" and "verified but never finished the form"
// abandonment cases) via TTL — no separate cleanup job needed.
const pendingSignupSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    otp: { type: String, select: false },
    otpExpiry: { type: Date, select: false },
    otpAttempts: { type: Number, default: 0, select: false },
    verified: { type: Boolean, default: false },
    verificationToken: { type: String, select: false },
    verificationTokenExpiry: { type: Date, select: false },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

pendingSignupSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('PendingSignup', pendingSignupSchema);
