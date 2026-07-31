import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadImage, deleteImage } from '../services/upload.service.js';

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, notificationPreferences } = req.body;
  const user = await User.findById(req.user._id);

  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (notificationPreferences) {
    user.notificationPreferences = { ...user.notificationPreferences, ...notificationPreferences };
  }

  if (req.file) {
    if (user.avatar?.publicId) await deleteImage(user.avatar.publicId);
    user.avatar = await uploadImage(req.file.path, 'savoria/avatars');
  }

  await user.save();

  res.status(200).json(new ApiResponse(200, { user: user.toSafeObject() }, 'Profile updated'));
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  if (!user.password || !(await user.comparePassword(currentPassword))) {
    throw new ApiError(401, 'Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json(new ApiResponse(200, null, 'Password changed successfully'));
});

export const listAddresses = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, { addresses: req.user.addresses }));
});

export const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (req.body.isDefault) {
    user.addresses.forEach((addr) => {
      addr.isDefault = false;
    });
  }

  user.addresses.push(req.body);
  await user.save();

  res.status(201).json(new ApiResponse(201, { addresses: user.addresses }, 'Address added'));
});

export const updateAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const address = user.addresses.id(req.params.addressId);
  if (!address) throw new ApiError(404, 'Address not found');

  if (req.body.isDefault) {
    user.addresses.forEach((addr) => {
      addr.isDefault = false;
    });
  }

  Object.assign(address, req.body);
  await user.save();

  res.status(200).json(new ApiResponse(200, { addresses: user.addresses }, 'Address updated'));
});

export const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.addresses.pull(req.params.addressId);
  await user.save();

  res.status(200).json(new ApiResponse(200, { addresses: user.addresses }, 'Address removed'));
});

export const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'wishlist',
    select: 'name slug images price discountPrice ratingsAverage isAvailable',
  });

  res.status(200).json(new ApiResponse(200, { wishlist: user.wishlist }));
});

export const toggleWishlist = asyncHandler(async (req, res) => {
  const { dishId } = req.params;
  const user = await User.findById(req.user._id);

  const index = user.wishlist.findIndex((id) => id.toString() === dishId);
  let added;
  if (index >= 0) {
    user.wishlist.splice(index, 1);
    added = false;
  } else {
    user.wishlist.push(dishId);
    added = true;
  }
  await user.save();

  res.status(200).json(new ApiResponse(200, { added }, added ? 'Added to wishlist' : 'Removed from wishlist'));
});
