import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, maxlength: 200 },
    type: { type: String, enum: ['percentage', 'flat', 'free_delivery'], required: true },
    value: { type: Number, min: 0, default: 0 },
    minPurchase: { type: Number, min: 0, default: 0 },
    maxDiscount: { type: Number, min: 0 },
    usageLimit: { type: Number, min: 1 },
    usedCount: { type: Number, default: 0 },
    expiryDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

couponSchema.methods.isValidForUse = function isValidForUse(subtotal) {
  if (!this.isActive) return { valid: false, reason: 'Coupon is no longer active' };
  if (this.expiryDate < new Date()) return { valid: false, reason: 'Coupon has expired' };
  if (this.usageLimit && this.usedCount >= this.usageLimit) {
    return { valid: false, reason: 'Coupon usage limit reached' };
  }
  if (subtotal < this.minPurchase) {
    return { valid: false, reason: `Minimum purchase of $${this.minPurchase.toFixed(2)} required` };
  }
  return { valid: true };
};

couponSchema.methods.calculateDiscount = function calculateDiscount(subtotal) {
  if (this.type === 'flat') return Math.min(this.value, subtotal);
  if (this.type === 'percentage') {
    const discount = (subtotal * this.value) / 100;
    return this.maxDiscount ? Math.min(discount, this.maxDiscount) : discount;
  }
  return 0;
};

export default mongoose.model('Coupon', couponSchema);
