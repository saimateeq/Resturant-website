import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, default: 'Home' },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String },
    zipCode: { type: String },
    country: { type: String, default: 'USA' },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true, timestamps: true },
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email address'],
    },
    password: { type: String, minlength: 8, select: false },
    phone: { type: String, trim: true },
    avatar: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    role: {
      type: String,
      enum: ['customer', 'admin', 'manager', 'chef', 'waiter', 'cashier', 'rider'],
      default: 'customer',
    },
    googleId: { type: String, select: false },

    isEmailVerified: { type: Boolean, default: false },
    emailOtp: { type: String, select: false },
    emailOtpExpiry: { type: Date, select: false },
    emailOtpAttempts: { type: Number, default: 0, select: false },

    passwordResetToken: { type: String, select: false },
    passwordResetExpiry: { type: Date, select: false },

    refreshToken: { type: String, select: false },

    isBlocked: { type: Boolean, default: false },
    rewardPoints: { type: Number, default: 0, min: 0 },

    addresses: [addressSchema],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Dish' }],

    notificationPreferences: {
      orderUpdates: { type: Boolean, default: true },
      promotions: { type: Boolean, default: true },
    },
  },
  { timestamps: true },
);

userSchema.index({ role: 1 });

// Auto-delete accounts that never verify their email within 5 minutes of
// registration. MongoDB's TTL monitor re-checks the partial filter on each
// pass, so a document stops matching (and is safe) the moment it's verified.
userSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 5 * 60, partialFilterExpression: { isEmailVerified: false } },
);

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeObject = function toSafeObject() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  delete obj.emailOtp;
  delete obj.emailOtpExpiry;
  delete obj.emailOtpAttempts;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpiry;
  delete obj.googleId;
  return obj;
};

export default mongoose.model('User', userSchema);
