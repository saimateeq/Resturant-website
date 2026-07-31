import { Router } from 'express';
import * as reservationController from '../controllers/reservation.controller.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createReservationValidator,
  updateReservationStatusValidator,
} from '../validators/reservation.validator.js';

const router = Router();

router.use(protect);

router.post('/', createReservationValidator, validate, reservationController.createReservation);
router.get('/my-reservations', reservationController.getMyReservations);
router.patch('/:id/cancel', reservationController.cancelReservation);

router.get('/', authorize('admin', 'manager', 'waiter'), reservationController.listAllReservations);
router.patch(
  '/:id/status',
  authorize('admin', 'manager', 'waiter'),
  updateReservationStatusValidator,
  validate,
  reservationController.updateReservationStatus,
);
router.patch(
  '/:id/reschedule',
  authorize('admin', 'manager', 'waiter'),
  reservationController.rescheduleReservation,
);

export default router;
