import Order from '../models/Order.js';
import Dish from '../models/Dish.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getRecommendations = asyncHandler(async (req, res) => {
  const pastOrders = await Order.find({ user: req.user._id }).select('items.dish');
  const orderedDishIds = [...new Set(pastOrders.flatMap((o) => o.items.map((i) => i.dish.toString())))];

  let recommendations = [];

  if (orderedDishIds.length > 0) {
    const orderedDishes = await Dish.find({ _id: { $in: orderedDishIds } }).select('category');
    const categoryIds = [...new Set(orderedDishes.map((d) => d.category.toString()))];

    recommendations = await Dish.find({
      category: { $in: categoryIds },
      _id: { $nin: orderedDishIds },
      isAvailable: true,
    })
      .sort({ ratingsAverage: -1, orderCount: -1 })
      .limit(8)
      .populate('category', 'name');
  }

  if (recommendations.length < 4) {
    const fallback = await Dish.find({
      _id: { $nin: [...orderedDishIds, ...recommendations.map((d) => d._id.toString())] },
      isAvailable: true,
    })
      .sort({ orderCount: -1 })
      .limit(8 - recommendations.length);
    recommendations = [...recommendations, ...fallback];
  }

  res.status(200).json(new ApiResponse(200, { dishes: recommendations }));
});

export const getFrequentlyOrdered = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).select('items');

  const counts = new Map();
  orders.forEach((order) => {
    order.items.forEach((item) => {
      const key = item.dish.toString();
      counts.set(key, (counts.get(key) || 0) + item.quantity);
    });
  });

  const topDishIds = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([id]) => id);

  const dishes = await Dish.find({ _id: { $in: topDishIds }, isAvailable: true });
  const ordered = topDishIds.map((id) => dishes.find((d) => d._id.toString() === id)).filter(Boolean);

  res.status(200).json(new ApiResponse(200, { dishes: ordered }));
});

export const getSearchSuggestions = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length < 2) {
    return res.status(200).json(new ApiResponse(200, { suggestions: [] }));
  }

  const suggestions = await Dish.find({
    name: { $regex: `^${q.trim()}`, $options: 'i' },
    isAvailable: true,
  })
    .select('name slug images price')
    .limit(6);

  res.status(200).json(new ApiResponse(200, { suggestions }));
});

export const getDietaryRecommendations = asyncHandler(async (req, res) => {
  const { diet } = req.query;
  const filter = { isAvailable: true };

  if (diet === 'vegetarian') filter.isVegetarian = true;
  if (diet === 'vegan') filter.isVegan = true;
  if (diet === 'halal') filter.isHalal = true;

  const dishes = await Dish.find(filter).sort({ ratingsAverage: -1 }).limit(8);

  res.status(200).json(new ApiResponse(200, { dishes }));
});
