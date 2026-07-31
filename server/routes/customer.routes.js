import { Router } from 'express';
import * as customerController from '../controllers/customer.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.use(protect, authorize('admin', 'manager'));

router.get('/', customerController.listCustomers);
router.get('/:id', customerController.getCustomerDetail);
router.patch('/:id/block-status', customerController.setCustomerBlockedStatus);
router.patch('/:id/reward-points', customerController.adjustRewardPoints);

export default router;
