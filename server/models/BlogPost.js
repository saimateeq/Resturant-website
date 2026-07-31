import mongoose from 'mongoose';

const blogPostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    slug: { type: String, required: true, unique: true, lowercase: true },
    excerpt: { type: String, required: true, maxlength: 300 },
    content: { type: String, required: true },
    coverImage: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: {
      type: String,
      enum: ['recipe', 'cooking-tips', 'news', 'event'],
      default: 'news',
    },
    tags: [{ type: String, trim: true }],
    isPublished: { type: Boolean, default: true },
    publishedAt: { type: Date, default: Date.now },
    viewCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

blogPostSchema.index({ title: 'text', content: 'text' });
blogPostSchema.index({ category: 1, isPublished: 1 });

blogPostSchema.pre('validate', function generateSlug() {
  if (this.title && (!this.slug || this.isModified('title'))) {
    this.slug = `${this.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')}-${Math.random().toString(36).slice(2, 7)}`;
  }
});

export default mongoose.model('BlogPost', blogPostSchema);
