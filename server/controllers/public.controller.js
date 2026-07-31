import Subscriber from '../models/Subscriber.js';
import ContactMessage from '../models/ContactMessage.js';
import Coupon from '../models/Coupon.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const subscribeNewsletter = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new ApiError(400, 'Email is required');

  await Subscriber.updateOne({ email }, { email }, { upsert: true });

  res.status(200).json(new ApiResponse(200, null, 'Subscribed! Watch your inbox for offers.'));
});

export const submitContactMessage = asyncHandler(async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !email || !message) throw new ApiError(400, 'Name, email, and message are required');

  const contactMessage = await ContactMessage.create({ name, email, phone, subject, message });

  res
    .status(201)
    .json(new ApiResponse(201, { id: contactMessage._id }, "Thanks for reaching out — we'll be in touch soon."));
});

export const getActiveOffers = asyncHandler(async (req, res) => {
  const offers = await Coupon.find({
    isActive: true,
    expiryDate: { $gt: new Date() },
  })
    .select('code description type value maxDiscount expiryDate')
    .sort({ createdAt: -1 })
    .limit(6);

  res.status(200).json(new ApiResponse(200, { offers }));
});

export const listContactMessages = asyncHandler(async (req, res) => {
  const messages = await ContactMessage.find().sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, { messages }));
});

export const resolveContactMessage = asyncHandler(async (req, res) => {
  const message = await ContactMessage.findByIdAndUpdate(
    req.params.id,
    { isResolved: true },
    { new: true },
  );
  if (!message) throw new ApiError(404, 'Message not found');

  res.status(200).json(new ApiResponse(200, { message }, 'Marked as resolved'));
});
