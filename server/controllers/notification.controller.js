import Notification from '../models/Notification.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50);
  const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });

  res.status(200).json(new ApiResponse(200, { notifications, unreadCount }));
});

export const markAsRead = asyncHandler(async (req, res) => {
  await Notification.updateOne(
    { _id: req.params.id, user: req.user._id },
    { isRead: true },
  );
  res.status(200).json(new ApiResponse(200, null, 'Marked as read'));
});

export const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
  res.status(200).json(new ApiResponse(200, null, 'All notifications marked as read'));
});
