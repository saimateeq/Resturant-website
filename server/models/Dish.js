import mongoose from 'mongoose';

const dishSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true, maxlength: 1000 },
    ingredients: [{ type: String, trim: true }],
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, default: '' },
      },
    ],

    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },

    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },

    calories: { type: Number, min: 0 },
    prepTimeMinutes: { type: Number, min: 0 },

    isVegetarian: { type: Boolean, default: false },
    isVegan: { type: Boolean, default: false },
    isHalal: { type: Boolean, default: false },

    isAvailable: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    isSeasonal: { type: Boolean, default: false },

    ratingsAverage: { type: Number, default: 0, min: 0, max: 5 },
    ratingsCount: { type: Number, default: 0 },

    orderCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },

    nutrition: {
      protein: Number,
      carbs: Number,
      fat: Number,
      fiber: Number,
      sugar: Number,
      sodium: Number,
    },
  },
  { timestamps: true },
);

dishSchema.index({ name: 'text', description: 'text' });
dishSchema.index({ category: 1, isAvailable: 1 });
dishSchema.index({ price: 1 });
dishSchema.index({ isFeatured: 1 });
dishSchema.index({ orderCount: -1 });

dishSchema.pre('validate', function generateSlug() {
  if (this.name && (!this.slug || this.isModified('name'))) {
    this.slug = `${this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')}-${Math.random().toString(36).slice(2, 7)}`;
  }
});

dishSchema.virtual('effectivePrice').get(function effectivePrice() {
  return this.discountPrice && this.discountPrice < this.price ? this.discountPrice : this.price;
});

dishSchema.set('toJSON', { virtuals: true });
dishSchema.set('toObject', { virtuals: true });

export default mongoose.model('Dish', dishSchema);
