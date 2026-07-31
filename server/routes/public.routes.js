import { Router } from 'express';
import * as publicController from '../controllers/public.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.post('/newsletter/subscribe', publicController.subscribeNewsletter);
router.post('/contact', publicController.submitContactMessage);
router.get('/offers', publicController.getActiveOffers);

router.get('/contact-messages', protect, authorize('admin', 'manager'), publicController.listContactMessages);
router.patch(
  '/contact-messages/:id/resolve',
  protect,
  authorize('admin', 'manager'),
  publicController.resolveContactMessage,
);

export default router;
