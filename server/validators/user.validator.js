import { body } from 'express-validator';

export const updateProfileValidator = [
  body('name').optional().trim().notEmpty().isLength({ max: 80 }).withMessage('Name must be 1-80 characters'),
  body('phone').optional().trim().isLength({ max: 20 }).withMessage('Phone number is too long'),
];

export const addressValidator = [
  body('street').trim().notEmpty().withMessage('Street is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
];

export const changePasswordValidator = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters'),
];
