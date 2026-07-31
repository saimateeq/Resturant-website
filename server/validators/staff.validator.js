import { body } from 'express-validator';

export const createStaffValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('role')
    .isIn(['manager', 'chef', 'waiter', 'cashier', 'rider', 'admin'])
    .withMessage('Invalid staff role'),
];
