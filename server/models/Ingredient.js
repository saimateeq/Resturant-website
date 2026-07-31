import mongoose from 'mongoose';

const purchaseSchema = new mongoose.Schema(
  {
    quantity: { type: Number, required: true },
    cost: { type: Number, required: true },
    supplier: { type: String },
    date: { type: Date, default: Date.now },
  },
  { _id: false },
);

const ingredientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    unit: { type: String, enum: ['kg', 'g', 'liter', 'ml', 'pieces', 'dozen'], required: true },
    currentStock: { type: Number, required: true, min: 0, default: 0 },
    lowStockThreshold: { type: Number, required: true, min: 0, default: 10 },
    expiryDate: { type: Date },
    costPerUnit: { type: Number, min: 0 },
    supplier: {
      name: { type: String },
      contact: { type: String },
    },
    purchaseHistory: [purchaseSchema],
  },
  { timestamps: true },
);

ingredientSchema.virtual('isLowStock').get(function isLowStock() {
  return this.currentStock <= this.lowStockThreshold;
});

ingredientSchema.set('toJSON', { virtuals: true });
ingredientSchema.set('toObject', { virtuals: true });

export default mongoose.model('Ingredient', ingredientSchema);
