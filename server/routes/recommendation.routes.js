import { Router } from 'express';
import * as recommendationController from '../controllers/recommendation.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/search-suggestions', recommendationController.getSearchSuggestions);
router.get('/dietary', recommendationController.getDietaryRecommendations);

router.get('/for-you', protect, recommendationController.getRecommendations);
router.get('/frequently-ordered', protect, recommendationController.getFrequentlyOrdered);

export default router;
