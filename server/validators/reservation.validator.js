import { body } from 'express-validator';

export const createReservationValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('date').isISO8601().withMessage('A valid date is required'),
  body('time').trim().notEmpty().withMessage('Time is required'),
  body('guests').isInt({ min: 1, max: 30 }).withMessage('Guests must be between 1 and 30'),
  body('seating').optional().isIn(['indoor', 'outdoor']),
  body('occasion').optional().isIn(['none', 'birthday', 'meeting', 'wedding', 'anniversary', 'other']),
];

export const updateReservationStatusValidator = [
  body('status').isIn(['pending', 'approved', 'rejected', 'cancelled', 'completed']).withMessage('Invalid status'),
];
