import Order from '../models/Order.js';
import Dish from '../models/Dish.js';
import Coupon from '../models/Coupon.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { calculateTotals, generateOrderNumber } from '../services/order.service.js';
import { sendOrderConfirmationEmail } from '../services/email.service.js';
import { notifyUser } from '../services/notification.service.js';

const STATUS_FLOW = ['pending', 'accepted', 'preparing', 'ready', 'delivered'];

export const createOrder = asyncHandler(async (req, res) => {
  const { items, deliveryType, address, phone, specialNotes, couponCode, paymentMethod } = req.body;

  if (!items?.length) throw new ApiError(400, 'Cart is empty');
  if (deliveryType === 'delivery' && (!address?.street || !address?.city)) {
    throw new ApiError(400, 'Delivery address is required');
  }

  const dishIds = items.map((item) => item.dishId);
  const dishes = await Dish.find({ _id: { $in: dishIds }, isAvailable: true });
  const dishMap = new Map(dishes.map((d) => [d._id.toString(), d]));

  const orderItems = items.map((item) => {
    const dish = dishMap.get(item.dishId);
    if (!dish) throw new ApiError(400, `A dish in your cart is no longer available`);
    const price = dish.discountPrice && dish.discountPrice < dish.price ? dish.discountPrice : dish.price;
    return {
      dish: dish._id,
      name: dish.name,
      image: dish.images?.[0]?.url,
      price,
      quantity: Math.max(1, Number(item.quantity) || 1),
    };
  });

  const subtotal = Number(
    orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2),
  );

  let discount = 0;
  let freeDelivery = false;
  let couponInfo = null;

  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
    if (!coupon) throw new ApiError(400, 'Invalid coupon code');
    const { valid, reason } = coupon.isValidForUse(subtotal);
    if (!valid) throw new ApiError(400, reason);

    freeDelivery = coupon.type === 'free_delivery';
    discount = freeDelivery ? 0 : coupon.calculateDiscount(subtotal);
    couponInfo = { code: coupon.code, discountApplied: discount };

    const usageFilter = { _id: coupon._id };
    if (coupon.usageLimit) usageFilter.usedCount = { $lt: coupon.usageLimit };
    const reserved = await Coupon.findOneAndUpdate(usageFilter, { $inc: { usedCount: 1 } });
    if (!reserved) throw new ApiError(400, 'Coupon usage limit reached');
  }

  const { tax, deliveryFee, total } = calculateTotals({ subtotal, deliveryType, discount, freeDelivery });

  const order = await Order.create({
    orderNumber: generateOrderNumber(),
    user: req.user._id,
    items: orderItems,
    deliveryType,
    address: deliveryType === 'delivery' ? address : undefined,
    phone,
    specialNotes,
    subtotal,
    tax,
    deliveryFee,
    discount,
    total,
    coupon: couponInfo,
    paymentMethod: paymentMethod || 'cash_on_delivery',
  });

  await Dish.bulkWrite(
    orderItems.map((item) => ({
      updateOne: { filter: { _id: item.dish }, update: { $inc: { orderCount: item.quantity } } },
    })),
  );

  await sendOrderConfirmationEmail(req.user.email, order).catch(() => {});

  res.status(201).json(new ApiResponse(201, { order }, 'Order placed successfully'));
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = { user: req.user._id };
  if (status) filter.status = status;

  const orders = await Order.find(filter).sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, { orders }));
});

export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) throw new ApiError(404, 'Order not found');

  const isOwner = order.user._id.toString() === req.user._id.toString();
  const isAssignedRider =
    req.user.role === 'rider' && order.assignedRider?.toString() === req.user._id.toString();
  const isStaff = ['admin', 'manager', 'chef', 'waiter', 'cashier'].includes(req.user.role);
  if (!isOwner && !isStaff && !isAssignedRider) throw new ApiError(403, 'You cannot view this order');

  res.status(200).json(new ApiResponse(200, { order }));
});

export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Order not found');
  if (order.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You cannot cancel this order');
  }
  if (!['pending', 'accepted'].includes(order.status)) {
    throw new ApiError(400, 'This order can no longer be cancelled');
  }

  order.status = 'cancelled';
  await order.save();

  res.status(200).json(new ApiResponse(200, { order }, 'Order cancelled'));
});

export const listAllOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(100, Math.max(1, Number(limit)));

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Order.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      orders,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    }),
  );
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Order not found');

  const validStatuses = [...STATUS_FLOW, 'cancelled', 'refunded'];
  if (!validStatuses.includes(status)) throw new ApiError(400, 'Invalid order status');

  order.status = status;
  if (note) order._pendingStatusNote = note;
  await order.save();

  await notifyUser(order.user, {
    type: 'order',
    title: `Order #${order.orderNumber} ${status}`,
    message: `Your order is now ${status}.`,
    link: `/orders/${order._id}`,
  }).catch(() => {});

  res.status(200).json(new ApiResponse(200, { order }, 'Order status updated'));
});
