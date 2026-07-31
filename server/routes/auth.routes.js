import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import {
  registerValidator,
  loginValidator,
  verifyOtpValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  googleAuthValidator,
} from '../validators/auth.validator.js';

const router = Router();

router.post('/register', authLimiter, registerValidator, validate, authController.register);
router.post('/verify-otp', authLimiter, verifyOtpValidator, validate, authController.verifyOtp);
router.post('/resend-otp', authLimiter, authController.resendOtp);
router.post('/login', authLimiter, loginValidator, validate, authController.login);
router.post('/google', authLimiter, googleAuthValidator, validate, authController.googleAuth);
router.post('/refresh-token', authController.refreshTokenHandler);
router.post('/logout', authController.logout);
router.post(
  '/forgot-password',
  authLimiter,
  forgotPasswordValidator,
  validate,
  authController.forgotPassword,
);
router.post(
  '/reset-password',
  authLimiter,
  resetPasswordValidator,
  validate,
  authController.resetPassword,
);
router.get('/me', protect, authController.getMe);

export default router;
