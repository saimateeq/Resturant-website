import { Router } from 'express';
import * as couponController from '../controllers/coupon.controller.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { couponValidator, validateCouponValidator } from '../validators/order.validator.js';

const router = Router();

router.post('/validate', protect, validateCouponValidator, validate, couponController.validateCoupon);

router.use(protect, authorize('admin', 'manager'));
router.get('/', couponController.listCoupons);
router.post('/', couponValidator, validate, couponController.createCoupon);
router.patch('/:id', couponController.updateCoupon);
router.delete('/:id', couponController.deleteCoupon);

export default router;
