import { Router } from 'express';
import * as dishController from '../controllers/dish.controller.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { dishValidator } from '../validators/dish.validator.js';
import { upload } from '../config/multer.js';

const router = Router();

router.get('/', dishController.listDishes);
router.get('/trending', dishController.getTrendingDishes);
router.get('/:slug', dishController.getDish);

router.use(protect, authorize('admin', 'manager', 'chef'));
router.post('/', upload.array('images', 6), dishValidator, validate, dishController.createDish);
router.patch('/:id', upload.array('images', 6), dishController.updateDish);
router.delete('/:id', dishController.deleteDish);
router.delete('/:id/images/:imageId', dishController.removeDishImage);

export default router;
