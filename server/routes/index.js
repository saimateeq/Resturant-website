import { Router } from 'express';
import { ApiResponse } from '../utils/ApiResponse.js';
import authRoutes from './auth.routes.js';
import categoryRoutes from './category.routes.js';
import dishRoutes from './dish.routes.js';
import orderRoutes from './order.routes.js';
import couponRoutes from './coupon.routes.js';
import reservationRoutes from './reservation.routes.js';
import reviewRoutes from './review.routes.js';
import userRoutes from './user.routes.js';
import notificationRoutes from './notification.routes.js';
import analyticsRoutes from './analytics.routes.js';
import customerRoutes from './customer.routes.js';
import staffRoutes from './staff.routes.js';
import inventoryRoutes from './inventory.routes.js';
import blogRoutes from './blog.routes.js';
import publicRoutes from './public.routes.js';
import recommendationRoutes from './recommendation.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/dishes', dishRoutes);
router.use('/orders', orderRoutes);
router.use('/coupons', couponRoutes);
router.use('/reservations', reservationRoutes);
router.use('/reviews', reviewRoutes);
router.use('/users', userRoutes);
router.use('/notifications', notificationRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/customers', customerRoutes);
router.use('/staff', staffRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/blog', blogRoutes);
router.use('/', publicRoutes);
router.use('/recommendations', recommendationRoutes);

router.get('/health', (req, res) => {
  res.status(200).json(new ApiResponse(200, { uptime: process.uptime() }, 'API is healthy'));
});

export default router;
