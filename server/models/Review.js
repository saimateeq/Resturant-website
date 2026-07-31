import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    dish: { type: mongoose.Schema.Types.ObjectId, ref: 'Dish', required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },

    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, maxlength: 1000 },
    images: [{ url: String, publicId: String }],

    restaurantReply: {
      text: { type: String },
      repliedAt: { type: Date },
    },

    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    reportCount: { type: Number, default: 0 },
    isHidden: { type: Boolean, default: false },
  },
  { timestamps: true },
);

reviewSchema.index({ dish: 1, createdAt: -1 });
reviewSchema.index({ user: 1, dish: 1 }, { unique: true });

export default mongoose.model('Review', reviewSchema);
