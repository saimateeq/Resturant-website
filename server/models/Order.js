import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    dish: { type: mongoose.Schema.Types.ObjectId, ref: 'Dish', required: true },
    name: { type: String, required: true },
    image: { type: String },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    note: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],

    deliveryType: { type: String, enum: ['delivery', 'pickup'], default: 'delivery' },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    phone: { type: String, required: true },
    specialNotes: { type: String, maxlength: 500 },

    subtotal: { type: Number, required: true, min: 0 },
    tax: { type: Number, required: true, min: 0 },
    deliveryFee: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },

    coupon: {
      code: String,
      discountApplied: Number,
    },

    paymentMethod: { type: String, enum: ['cash_on_delivery', 'card'], default: 'cash_on_delivery' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },

    status: {
      type: String,
      enum: ['pending', 'accepted', 'preparing', 'ready', 'delivered', 'cancelled', 'refunded'],
      default: 'pending',
    },
    statusHistory: [statusHistorySchema],

    assignedRider: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });

orderSchema.pre('save', function pushHistory() {
  if (this.isNew || this.isModified('status')) {
    this.statusHistory.push({ status: this.status, note: this._pendingStatusNote });
  }
});

export default mongoose.model('Order', orderSchema);
