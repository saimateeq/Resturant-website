import { Router } from 'express';
import * as staffController from '../controllers/staff.controller.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createStaffValidator } from '../validators/staff.validator.js';

const router = Router();

router.use(protect, authorize('admin'));

router.get('/', staffController.listStaff);
router.post('/', createStaffValidator, validate, staffController.createStaff);
router.patch('/:id/role', staffController.updateStaffRole);
router.delete('/:id', staffController.removeStaff);

export default router;
