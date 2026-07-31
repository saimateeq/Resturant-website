import { body } from 'express-validator';

export const ingredientValidator = [
  body('name').trim().notEmpty().withMessage('Ingredient name is required'),
  body('unit').isIn(['kg', 'g', 'liter', 'ml', 'pieces', 'dozen']).withMessage('Invalid unit'),
  body('currentStock').isFloat({ min: 0 }).withMessage('Current stock must be a positive number'),
];

export const purchaseValidator = [
  body('quantity').isFloat({ gt: 0 }).withMessage('Quantity must be greater than 0'),
  body('cost').isFloat({ min: 0 }).withMessage('Cost must be a positive number'),
];
