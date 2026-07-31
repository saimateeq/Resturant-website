import { Router } from 'express';
import * as reviewController from '../controllers/review.controller.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createReviewValidator } from '../validators/review.validator.js';
import { upload } from '../config/multer.js';

const router = Router();

router.get('/dish/:dishId', reviewController.getDishReviews);

router.use(protect);
router.post('/', upload.array('images', 4), createReviewValidator, validate, reviewController.createReview);
router.patch('/:id', reviewController.updateReview);
router.delete('/:id', reviewController.deleteReview);
router.post('/:id/like', reviewController.likeReview);
router.post('/:id/report', reviewController.reportReview);

router.get('/', authorize('admin', 'manager'), reviewController.listAllReviews);
router.patch('/:id/reply', authorize('admin', 'manager'), reviewController.replyToReview);
router.patch('/:id/moderate', authorize('admin', 'manager'), reviewController.moderateReview);

export default router;
