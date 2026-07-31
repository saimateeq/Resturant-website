import { Router } from 'express';
import * as inventoryController from '../controllers/inventory.controller.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { ingredientValidator, purchaseValidator } from '../validators/inventory.validator.js';

const router = Router();

router.use(protect, authorize('admin', 'manager', 'chef'));

router.get('/', inventoryController.listIngredients);
router.post('/', ingredientValidator, validate, inventoryController.createIngredient);
router.patch('/:id', inventoryController.updateIngredient);
router.delete('/:id', inventoryController.deleteIngredient);
router.post('/:id/purchase', purchaseValidator, validate, inventoryController.recordPurchase);

export default router;
