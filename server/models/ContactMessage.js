import mongoose from 'mongoose';

const contactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    subject: { type: String, trim: true },
    message: { type: String, required: true, maxlength: 2000 },
    isResolved: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.model('ContactMessage', contactMessageSchema);
