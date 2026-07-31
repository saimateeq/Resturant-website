import Coupon from '../models/Coupon.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, subtotal } = req.body;

  const coupon = await Coupon.findOne({ code: code?.toUpperCase() });
  if (!coupon) throw new ApiError(404, 'Invalid coupon code');

  const { valid, reason } = coupon.isValidForUse(Number(subtotal) || 0);
  if (!valid) throw new ApiError(400, reason);

  const discount =
    coupon.type === 'free_delivery' ? 0 : coupon.calculateDiscount(Number(subtotal) || 0);

  res.status(200).json(
    new ApiResponse(200, {
      code: coupon.code,
      type: coupon.type,
      discount,
      freeDelivery: coupon.type === 'free_delivery',
    }),
  );
});

export const listCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, { coupons }));
});

export const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create(req.body);
  res.status(201).json(new ApiResponse(201, { coupon }, 'Coupon created'));
});

export const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!coupon) throw new ApiError(404, 'Coupon not found');
  res.status(200).json(new ApiResponse(200, { coupon }, 'Coupon updated'));
});

export const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) throw new ApiError(404, 'Coupon not found');
  res.status(200).json(new ApiResponse(200, null, 'Coupon deleted'));
});
