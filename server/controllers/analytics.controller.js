import Order from '../models/Order.js';
import Reservation from '../models/Reservation.js';
import User from '../models/User.js';
import Dish from '../models/Dish.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const REVENUE_STATUSES = ['delivered', 'ready', 'preparing', 'accepted'];

export const getDashboardSummary = asyncHandler(async (req, res) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [
    totalRevenueAgg,
    todayRevenueAgg,
    totalOrders,
    todayOrders,
    totalReservations,
    pendingReservations,
    totalCustomers,
    popularDishes,
  ] = await Promise.all([
    Order.aggregate([
      { $match: { status: { $in: REVENUE_STATUSES } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
    Order.aggregate([
      { $match: { status: { $in: REVENUE_STATUSES }, createdAt: { $gte: startOfToday } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
    Order.countDocuments(),
    Order.countDocuments({ createdAt: { $gte: startOfToday } }),
    Reservation.countDocuments(),
    Reservation.countDocuments({ status: 'pending' }),
    User.countDocuments({ role: 'customer' }),
    Dish.find().sort({ orderCount: -1 }).limit(5).select('name orderCount images'),
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      totalRevenue: totalRevenueAgg[0]?.total || 0,
      todayRevenue: todayRevenueAgg[0]?.total || 0,
      totalOrders,
      todayOrders,
      totalReservations,
      pendingReservations,
      totalCustomers,
      popularDishes,
    }),
  );
});

export const getRevenueAnalytics = asyncHandler(async (req, res) => {
  const { period = 'week' } = req.query;

  const daysBack = period === 'year' ? 365 : period === 'month' ? 30 : 7;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);
  startDate.setHours(0, 0, 0, 0);

  const dateFormat = period === 'year' ? '%Y-%m' : '%Y-%m-%d';

  const revenue = await Order.aggregate([
    { $match: { status: { $in: REVENUE_STATUSES }, createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
        revenue: { $sum: '$total' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      { data: revenue.map((r) => ({ date: r._id, revenue: r.revenue, orders: r.orders })) },
    ),
  );
});

export const getOrderStatusBreakdown = asyncHandler(async (req, res) => {
  const breakdown = await Order.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  res
    .status(200)
    .json(new ApiResponse(200, { data: breakdown.map((b) => ({ status: b._id, count: b.count })) }));
});

export const getPopularDishes = asyncHandler(async (req, res) => {
  const dishes = await Dish.find()
    .sort({ orderCount: -1 })
    .limit(10)
    .select('name images orderCount ratingsAverage price');

  res.status(200).json(new ApiResponse(200, { dishes }));
});
