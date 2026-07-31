import mongoose from 'mongoose';
import Review from '../models/Review.js';
import Dish from '../models/Dish.js';

export async function recalculateDishRating(dishId) {
  const stats = await Review.aggregate([
    { $match: { dish: new mongoose.Types.ObjectId(dishId), isHidden: false } },
    { $group: { _id: '$dish', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  const { avgRating = 0, count = 0 } = stats[0] || {};

  await Dish.findByIdAndUpdate(dishId, {
    ratingsAverage: Number(avgRating.toFixed(1)),
    ratingsCount: count,
  });
}
