import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { verifyAccessToken } from '../services/token.service.js';
import User from '../models/User.js';

export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.split(' ')[1] : null;

  if (!token) {
    throw new ApiError(401, 'Not authenticated - no token provided');
  }

  const decoded = verifyAccessToken(token);
  const user = await User.findById(decoded.sub);

  if (!user) {
    throw new ApiError(401, 'User belonging to this token no longer exists');
  }

  if (user.isBlocked) {
    throw new ApiError(403, 'Your account has been blocked');
  }

  req.user = user;
  next();
});

export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new ApiError(403, 'You do not have permission to perform this action');
    }
    next();
  };
}

export const optionalAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.split(' ')[1] : null;

  if (token) {
    try {
      const decoded = verifyAccessToken(token);
      req.user = await User.findById(decoded.sub);
    } catch {
      req.user = null;
    }
  }

  next();
});
