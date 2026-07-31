import { Router } from 'express';
import * as orderController from '../controllers/order.controller.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createOrderValidator, updateOrderStatusValidator } from '../validators/order.validator.js';

const router = Router();

router.use(protect);

router.post('/', createOrderValidator, validate, orderController.createOrder);
router.get('/my-orders', orderController.getMyOrders);
router.get('/:id', orderController.getOrder);
router.patch('/:id/cancel', orderController.cancelOrder);

router.get('/', authorize('admin', 'manager', 'cashier'), orderController.listAllOrders);
router.patch(
  '/:id/status',
  authorize('admin', 'manager', 'chef', 'waiter'),
  updateOrderStatusValidator,
  validate,
  orderController.updateOrderStatus,
);

export default router;
