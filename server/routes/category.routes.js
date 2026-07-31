import { Router } from 'express';
import * as categoryController from '../controllers/category.controller.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { categoryValidator } from '../validators/dish.validator.js';
import { upload } from '../config/multer.js';

const router = Router();

router.get('/', categoryController.listCategories);
router.get('/:slug', categoryController.getCategory);

router.use(protect, authorize('admin', 'manager'));
router.post('/', upload.single('image'), categoryValidator, validate, categoryController.createCategory);
router.patch('/:id', upload.single('image'), categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

export default router;
