import Review from '../models/Review.js';
import Order from '../models/Order.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { recalculateDishRating } from '../services/rating.service.js';
import { uploadImage } from '../services/upload.service.js';

export const getDishReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(50, Math.max(1, Number(limit)));

  const filter = { dish: req.params.dishId, isHidden: false };

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Review.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      reviews,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    }),
  );
});

export const createReview = asyncHandler(async (req, res) => {
  const { dishId, rating, comment } = req.body;

  const existing = await Review.findOne({ user: req.user._id, dish: dishId });
  if (existing) throw new ApiError(409, 'You have already reviewed this dish');

  const verifiedOrder = await Order.findOne({
    user: req.user._id,
    'items.dish': dishId,
    status: 'delivered',
  });

  const images = req.files?.length
    ? await Promise.all(req.files.map((file) => uploadImage(file.path, 'savoria/reviews')))
    : [];

  const review = await Review.create({
    user: req.user._id,
    dish: dishId,
    order: verifiedOrder?._id,
    rating,
    comment,
    images,
  });

  await recalculateDishRating(dishId);

  res.status(201).json(new ApiResponse(201, { review }, 'Review submitted'));
});

export const updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new ApiError(404, 'Review not found');
  if (review.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You can only edit your own review');
  }

  if (req.body.rating) review.rating = req.body.rating;
  if (req.body.comment) review.comment = req.body.comment;
  await review.save();

  await recalculateDishRating(review.dish);

  res.status(200).json(new ApiResponse(200, { review }, 'Review updated'));
});

export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new ApiError(404, 'Review not found');

  const isOwner = review.user.toString() === req.user._id.toString();
  const isStaff = ['admin', 'manager'].includes(req.user.role);
  if (!isOwner && !isStaff) throw new ApiError(403, 'You cannot delete this review');

  const dishId = review.dish;
  await review.deleteOne();
  await recalculateDishRating(dishId);

  res.status(200).json(new ApiResponse(200, null, 'Review deleted'));
});

export const likeReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new ApiError(404, 'Review not found');

  const alreadyLiked = review.likes.some((id) => id.toString() === req.user._id.toString());
  if (alreadyLiked) {
    review.likes = review.likes.filter((id) => id.toString() !== req.user._id.toString());
  } else {
    review.likes.push(req.user._id);
  }
  await review.save();

  res.status(200).json(new ApiResponse(200, { likes: review.likes.length, liked: !alreadyLiked }));
});

export const reportReview = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { $inc: { reportCount: 1 } },
    { new: true },
  );
  if (!review) throw new ApiError(404, 'Review not found');

  res.status(200).json(new ApiResponse(200, null, 'Review reported'));
});

export const replyToReview = asyncHandler(async (req, res) => {
  const { text } = req.body;
  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { restaurantReply: { text, repliedAt: new Date() } },
    { new: true },
  );
  if (!review) throw new ApiError(404, 'Review not found');

  res.status(200).json(new ApiResponse(200, { review }, 'Reply posted'));
});

export const listAllReviews = asyncHandler(async (req, res) => {
  const { reported } = req.query;
  const filter = reported === 'true' ? { reportCount: { $gt: 0 } } : {};

  const reviews = await Review.find(filter)
    .populate('user', 'name email')
    .populate('dish', 'name slug')
    .sort({ createdAt: -1 });

  res.status(200).json(new ApiResponse(200, { reviews }));
});

export const moderateReview = asyncHandler(async (req, res) => {
  const { isHidden } = req.body;
  const review = await Review.findByIdAndUpdate(req.params.id, { isHidden }, { new: true });
  if (!review) throw new ApiError(404, 'Review not found');

  await recalculateDishRating(review.dish);

  res.status(200).json(new ApiResponse(200, { review }, 'Review moderated'));
});
