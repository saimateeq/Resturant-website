import { Router } from 'express';
import * as analyticsController from '../controllers/analytics.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.use(protect, authorize('admin', 'manager'));

router.get('/summary', analyticsController.getDashboardSummary);
router.get('/revenue', analyticsController.getRevenueAnalytics);
router.get('/order-status', analyticsController.getOrderStatusBreakdown);
router.get('/popular-dishes', analyticsController.getPopularDishes);

export default router;
