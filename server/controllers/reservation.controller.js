import Reservation from '../models/Reservation.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendReservationStatusEmail } from '../services/email.service.js';
import { notifyUser } from '../services/notification.service.js';

export const createReservation = asyncHandler(async (req, res) => {
  const { name, phone, date, time, guests, seating, occasion, notes } = req.body;

  const reservationDate = new Date(date);
  if (reservationDate < new Date().setHours(0, 0, 0, 0)) {
    throw new ApiError(400, 'Reservation date cannot be in the past');
  }

  const reservation = await Reservation.create({
    user: req.user._id,
    name,
    phone,
    date: reservationDate,
    time,
    guests,
    seating,
    occasion,
    notes,
  });

  res.status(201).json(new ApiResponse(201, { reservation }, 'Reservation request submitted'));
});

export const getMyReservations = asyncHandler(async (req, res) => {
  const reservations = await Reservation.find({ user: req.user._id }).sort({ date: -1 });
  res.status(200).json(new ApiResponse(200, { reservations }));
});

export const cancelReservation = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findById(req.params.id);
  if (!reservation) throw new ApiError(404, 'Reservation not found');
  if (reservation.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You cannot cancel this reservation');
  }
  if (!['pending', 'approved'].includes(reservation.status)) {
    throw new ApiError(400, 'This reservation can no longer be cancelled');
  }

  reservation.status = 'cancelled';
  await reservation.save();

  res.status(200).json(new ApiResponse(200, { reservation }, 'Reservation cancelled'));
});

export const listAllReservations = asyncHandler(async (req, res) => {
  const { status, date, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    filter.date = { $gte: start, $lte: end };
  }

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(100, Math.max(1, Number(limit)));

  const [reservations, total] = await Promise.all([
    Reservation.find(filter)
      .populate('user', 'name email')
      .sort({ date: 1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Reservation.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      reservations,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    }),
  );
});

export const updateReservationStatus = asyncHandler(async (req, res) => {
  const { status, rejectionReason, tableNumber } = req.body;

  const reservation = await Reservation.findById(req.params.id).populate('user', 'name email');
  if (!reservation) throw new ApiError(404, 'Reservation not found');

  reservation.status = status;
  if (status === 'rejected') reservation.rejectionReason = rejectionReason;
  if (tableNumber) reservation.tableNumber = tableNumber;
  await reservation.save();

  if (['approved', 'rejected'].includes(status)) {
    await sendReservationStatusEmail(reservation.user.email, reservation).catch(() => {});
    await notifyUser(reservation.user._id, {
      type: 'reservation',
      title: `Reservation ${status}`,
      message: `Your table reservation for ${new Date(reservation.date).toDateString()} was ${status}.`,
      link: '/dashboard/reservations',
    }).catch(() => {});
  }

  res.status(200).json(new ApiResponse(200, { reservation }, 'Reservation updated'));
});

export const rescheduleReservation = asyncHandler(async (req, res) => {
  const { date, time } = req.body;
  const reservation = await Reservation.findById(req.params.id);
  if (!reservation) throw new ApiError(404, 'Reservation not found');

  reservation.date = new Date(date);
  reservation.time = time;
  reservation.status = 'pending';
  await reservation.save();

  res.status(200).json(new ApiResponse(200, { reservation }, 'Reservation rescheduled'));
});
