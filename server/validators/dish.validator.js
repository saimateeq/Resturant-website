import { body } from 'express-validator';

export const dishValidator = [
  body('name').trim().notEmpty().withMessage('Dish name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').notEmpty().withMessage('Category is required'),
];

export const categoryValidator = [body('name').trim().notEmpty().withMessage('Category name is required')];
