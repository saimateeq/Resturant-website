import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  addressValidator,
  changePasswordValidator,
  updateProfileValidator,
} from '../validators/user.validator.js';
import { upload } from '../config/multer.js';

const router = Router();

router.use(protect);

router.patch(
  '/profile',
  upload.single('avatar'),
  updateProfileValidator,
  validate,
  userController.updateProfile,
);
router.patch('/change-password', changePasswordValidator, validate, userController.changePassword);

router.get('/addresses', userController.listAddresses);
router.post('/addresses', addressValidator, validate, userController.addAddress);
router.patch('/addresses/:addressId', userController.updateAddress);
router.delete('/addresses/:addressId', userController.deleteAddress);

router.get('/wishlist', userController.getWishlist);
router.post('/wishlist/:dishId', userController.toggleWishlist);

export default router;
