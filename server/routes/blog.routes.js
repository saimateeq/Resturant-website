import { Router } from 'express';
import * as blogController from '../controllers/blog.controller.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { blogPostValidator } from '../validators/blog.validator.js';
import { upload } from '../config/multer.js';

const router = Router();

router.get('/', blogController.listPosts);
router.get('/:slug', blogController.getPost);

router.use(protect, authorize('admin', 'manager'));
router.get('/admin/all', blogController.listAllPostsAdmin);
router.post('/', upload.single('coverImage'), blogPostValidator, validate, blogController.createPost);
router.patch('/:id', upload.single('coverImage'), blogController.updatePost);
router.delete('/:id', blogController.deletePost);

export default router;
