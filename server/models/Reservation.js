import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    guests: { type: Number, required: true, min: 1, max: 30 },
    seating: { type: String, enum: ['indoor', 'outdoor'], default: 'indoor' },
    occasion: {
      type: String,
      enum: ['none', 'birthday', 'meeting', 'wedding', 'anniversary', 'other'],
      default: 'none',
    },
    notes: { type: String, maxlength: 500 },

    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled', 'completed'],
      default: 'pending',
    },
    tableNumber: { type: String },
    rejectionReason: { type: String },
  },
  { timestamps: true },
);

reservationSchema.index({ date: 1, status: 1 });
reservationSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('Reservation', reservationSchema);
