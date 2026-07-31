import { body } from 'express-validator';

export const createOrderValidator = [
  body('items').isArray({ min: 1 }).withMessage('Cart must contain at least one item'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('deliveryType').isIn(['delivery', 'pickup']).withMessage('Invalid delivery type'),
];

export const updateOrderStatusValidator = [
  body('status')
    .isIn(['pending', 'accepted', 'preparing', 'ready', 'delivered', 'cancelled', 'refunded'])
    .withMessage('Invalid order status'),
];

export const couponValidator = [
  body('code').trim().notEmpty().withMessage('Coupon code is required'),
  body('type').isIn(['percentage', 'flat', 'free_delivery']).withMessage('Invalid coupon type'),
  body('expiryDate').isISO8601().withMessage('Valid expiry date is required'),
];

export const validateCouponValidator = [
  body('code').trim().notEmpty().withMessage('Coupon code is required'),
  body('subtotal').isFloat({ min: 0 }).withMessage('Subtotal must be a positive number'),
];
