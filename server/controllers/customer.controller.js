import User from '../models/User.js';
import Order from '../models/Order.js';
import Reservation from '../models/Reservation.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listCustomers = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;

  const filter = { role: 'customer' };
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(100, Math.max(1, Number(limit)));

  const [customers, total] = await Promise.all([
    User.find(filter)
      .select('name email phone isBlocked rewardPoints createdAt')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    User.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      customers,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    }),
  );
});

export const getCustomerDetail = asyncHandler(async (req, res) => {
  const customer = await User.findOne({ _id: req.params.id, role: 'customer' }).select('-password');
  if (!customer) throw new ApiError(404, 'Customer not found');

  const [orders, reservations] = await Promise.all([
    Order.find({ user: customer._id }).sort({ createdAt: -1 }).limit(20),
    Reservation.find({ user: customer._id }).sort({ date: -1 }).limit(20),
  ]);

  res.status(200).json(new ApiResponse(200, { customer, orders, reservations }));
});

export const setCustomerBlockedStatus = asyncHandler(async (req, res) => {
  const { isBlocked } = req.body;
  const customer = await User.findOneAndUpdate(
    { _id: req.params.id, role: 'customer' },
    { isBlocked },
    { new: true },
  ).select('-password');
  if (!customer) throw new ApiError(404, 'Customer not found');

  res
    .status(200)
    .json(new ApiResponse(200, { customer }, isBlocked ? 'Customer blocked' : 'Customer unblocked'));
});

export const adjustRewardPoints = asyncHandler(async (req, res) => {
  const points = Number(req.body.points);
  if (!Number.isFinite(points) || !Number.isInteger(points)) {
    throw new ApiError(400, 'points must be an integer');
  }

  const customer = await User.findOneAndUpdate(
    { _id: req.params.id, role: 'customer' },
    { $inc: { rewardPoints: points } },
    { new: true, runValidators: true },
  ).select('-password');
  if (!customer) throw new ApiError(404, 'Customer not found');

  res.status(200).json(new ApiResponse(200, { customer }, 'Reward points updated'));
});
