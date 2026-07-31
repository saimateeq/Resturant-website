import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  generateOtp,
  refreshCookieOptions,
} from '../services/token.service.js';
import { sendOtpEmail, sendPasswordResetEmail } from '../services/email.service.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const OTP_EXPIRY_MS = 5 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 3;

async function issueSession(res, user, rememberMe = false) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  res.cookie('refreshToken', refreshToken, refreshCookieOptions(rememberMe));
  return accessToken;
}

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  const otp = generateOtp();
  const user = await User.create({
    name,
    email,
    password,
    phone,
    emailOtp: otp,
    emailOtpExpiry: Date.now() + OTP_EXPIRY_MS,
  });

  await sendOtpEmail(email, otp).catch((err) => {
    console.error('Failed to send OTP email:', err.message);
  });

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { email: user.email },
        'Account created. Check your email for a verification code.',
      ),
    );
});

export const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email }).select('+emailOtp +emailOtpExpiry +emailOtpAttempts');
  if (!user) {
    throw new ApiError(400, 'Invalid or expired verification code');
  }

  const isValid = user.emailOtp === otp && user.emailOtpExpiry > Date.now();

  if (!isValid) {
    user.emailOtpAttempts += 1;

    if (user.emailOtpAttempts >= MAX_OTP_ATTEMPTS) {
      await user.deleteOne();
      throw new ApiError(
        400,
        'Too many incorrect attempts. This account has been removed — please register again.',
        ['OTP_ATTEMPTS_EXCEEDED'],
      );
    }

    await user.save({ validateBeforeSave: false });
    const remaining = MAX_OTP_ATTEMPTS - user.emailOtpAttempts;
    throw new ApiError(
      400,
      `Invalid or expired verification code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
    );
  }

  user.isEmailVerified = true;
  user.emailOtp = undefined;
  user.emailOtpExpiry = undefined;
  user.emailOtpAttempts = 0;
  const accessToken = await issueSession(res, user);
  await user.save({ validateBeforeSave: false });

  res
    .status(200)
    .json(new ApiResponse(200, { user: user.toSafeObject(), accessToken }, 'Email verified'));
});

export const resendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, 'No account found with this email');
  if (user.isEmailVerified) throw new ApiError(400, 'Email is already verified');

  const otp = generateOtp();
  user.emailOtp = otp;
  user.emailOtpExpiry = Date.now() + OTP_EXPIRY_MS;
  user.emailOtpAttempts = 0;
  await user.save({ validateBeforeSave: false });
  await sendOtpEmail(email, otp).catch((err) => {
    console.error('Failed to send OTP email:', err.message);
  });

  res.status(200).json(new ApiResponse(200, null, 'Verification code resent'));
});

export const login = asyncHandler(async (req, res) => {
  const { email, password, rememberMe } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !user.password || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (user.isBlocked) {
    throw new ApiError(403, 'Your account has been blocked. Contact support.');
  }

  if (!user.isEmailVerified) {
    throw new ApiError(403, 'Please verify your email before logging in.', ['EMAIL_NOT_VERIFIED']);
  }

  const accessToken = await issueSession(res, user, rememberMe);

  res
    .status(200)
    .json(new ApiResponse(200, { user: user.toSafeObject(), accessToken }, 'Login successful'));
});

export const googleAuth = asyncHandler(async (req, res) => {
  const { idToken } = req.body;

  if (!process.env.GOOGLE_CLIENT_ID) {
    throw new ApiError(500, 'Google login is not configured on the server');
  }

  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();

  if (!payload.email_verified) {
    throw new ApiError(403, 'Google account email is not verified');
  }

  let user = await User.findOne({ email: payload.email });

  if (!user) {
    user = await User.create({
      name: payload.name,
      email: payload.email,
      googleId: payload.sub,
      isEmailVerified: true,
      avatar: { url: payload.picture || '' },
    });
  } else if (!user.googleId) {
    user.googleId = payload.sub;
    user.isEmailVerified = true;
    await user.save({ validateBeforeSave: false });
  }

  if (user.isBlocked) {
    throw new ApiError(403, 'Your account has been blocked. Contact support.');
  }

  const accessToken = await issueSession(res, user);

  res
    .status(200)
    .json(new ApiResponse(200, { user: user.toSafeObject(), accessToken }, 'Login successful'));
});

export const refreshTokenHandler = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) throw new ApiError(401, 'No refresh token provided');

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  const user = await User.findById(decoded.sub).select('+refreshToken');
  if (!user || user.refreshToken !== token) {
    throw new ApiError(401, 'Refresh token is no longer valid');
  }

  const accessToken = signAccessToken(user);
  res.status(200).json(new ApiResponse(200, { accessToken }, 'Token refreshed'));
});

export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (token) {
    try {
      const decoded = verifyRefreshToken(token);
      await User.findByIdAndUpdate(decoded.sub, { $unset: { refreshToken: 1 } });
    } catch {
      // token already invalid, nothing to clean up
    }
  }

  res.clearCookie('refreshToken', { path: '/api/v1/auth' });
  res.status(200).json(new ApiResponse(200, null, 'Logged out'));
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (user) {
    const rawToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    user.passwordResetExpiry = Date.now() + 30 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${rawToken}`;
    await sendPasswordResetEmail(email, resetUrl).catch((err) => {
      console.error('Failed to send password reset email:', err.message);
    });
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, null, 'If an account exists for that email, a reset link has been sent'),
    );
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpiry: { $gt: Date.now() },
  }).select('+passwordResetToken +passwordResetExpiry');

  if (!user) throw new ApiError(400, 'Password reset link is invalid or has expired');

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpiry = undefined;
  await user.save();

  res.status(200).json(new ApiResponse(200, null, 'Password reset successful. Please log in.'));
});

export const getMe = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, { user: req.user.toSafeObject() }));
});
