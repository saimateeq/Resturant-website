import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import Order from '../models/Order.js';
import Dish from '../models/Dish.js';
import User from '../models/User.js';
import { calculateTotals, generateOrderNumber } from '../services/order.service.js';

const ORDER_COUNT = 45;
const DAYS_BACK = 30;

const EXTRA_CUSTOMERS = [
  { name: 'Sophia Martinez', email: 'sophia@savoria.com', password: 'Customer@123', phone: '+1 555-0401' },
  { name: 'Liam Chen', email: 'liam@savoria.com', password: 'Customer@123', phone: '+1 555-0402' },
];

// Weighted so revenue/status-breakdown charts have a realistic mix.
const STATUS_WEIGHTS = [
  ['delivered', 60],
  ['preparing', 10],
  ['accepted', 10],
  ['ready', 5],
  ['pending', 10],
  ['cancelled', 3],
  ['refunded', 2],
];

const ADDRESSES = [
  { street: '221 Baker St', city: 'New York', state: 'NY', zipCode: '10001', country: 'USA' },
  { street: '742 Evergreen Terrace', city: 'New York', state: 'NY', zipCode: '10002', country: 'USA' },
  { street: '12 Maple Ave', city: 'Brooklyn', state: 'NY', zipCode: '11201', country: 'USA' },
];

function pickWeighted(weights) {
  const total = weights.reduce((sum, [, w]) => sum + w, 0);
  let roll = Math.random() * total;
  for (const [value, w] of weights) {
    roll -= w;
    if (roll <= 0) return value;
  }
  return weights[0][0];
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomPastDate(daysBack) {
  const now = Date.now();
  const offsetMs = Math.random() * daysBack * 24 * 60 * 60 * 1000;
  return new Date(now - offsetMs);
}

async function ensureCustomers() {
  const ids = [];
  const existing = await User.find({ role: 'customer' }).select('_id email');
  ids.push(...existing.map((u) => u._id));

  for (const c of EXTRA_CUSTOMERS) {
    let user = await User.findOne({ email: c.email });
    if (!user) {
      user = await User.create({ ...c, role: 'customer', isEmailVerified: true });
      console.log(`Created customer: ${c.email}`);
      ids.push(user._id);
    } else if (!ids.some((id) => id.equals(user._id))) {
      ids.push(user._id);
    }
  }
  return ids;
}

async function seed() {
  await connectDB();

  const customerIds = await ensureCustomers();
  const dishes = await Dish.find({ isAvailable: true });
  if (!dishes.length) {
    console.log('No dishes found — run `npm run seed:menu` first.');
    await mongoose.disconnect();
    return;
  }

  const orderCountByDish = new Map();
  let created = 0;

  for (let i = 0; i < ORDER_COUNT; i++) {
    const itemCount = 1 + Math.floor(Math.random() * 3);
    const chosenDishes = [];
    for (let j = 0; j < itemCount; j++) {
      const dish = pick(dishes);
      if (!chosenDishes.some((d) => d.dish._id.equals(dish._id))) chosenDishes.push({ dish, quantity: 1 + Math.floor(Math.random() * 3) });
    }

    const items = chosenDishes.map(({ dish, quantity }) => ({
      dish: dish._id,
      name: dish.name,
      image: dish.images?.[0]?.url,
      price: dish.discountPrice && dish.discountPrice < dish.price ? dish.discountPrice : dish.price,
      quantity,
    }));

    const subtotal = Number(items.reduce((sum, it) => sum + it.price * it.quantity, 0).toFixed(2));
    const deliveryType = Math.random() < 0.7 ? 'delivery' : 'pickup';
    const { tax, deliveryFee, total } = calculateTotals({ subtotal, deliveryType, discount: 0, freeDelivery: false });
    const status = pickWeighted(STATUS_WEIGHTS);
    const createdAt = randomPastDate(DAYS_BACK);

    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      user: pick(customerIds),
      items,
      deliveryType,
      address: deliveryType === 'delivery' ? pick(ADDRESSES) : undefined,
      phone: '+1 555-01' + String(10 + Math.floor(Math.random() * 89)),
      subtotal,
      tax,
      deliveryFee,
      discount: 0,
      total,
      paymentMethod: Math.random() < 0.6 ? 'cash_on_delivery' : 'card',
      paymentStatus: status === 'delivered' ? 'paid' : status === 'refunded' ? 'refunded' : 'pending',
      status,
    });

    // Backdate via the raw driver so Mongoose's timestamps plugin and the
    // pre-save status-history hook (both of which stamp "now") don't
    // overwrite these historical dates.
    await Order.collection.updateOne(
      { _id: order._id },
      {
        $set: {
          createdAt,
          updatedAt: createdAt,
          'statusHistory.0.timestamp': createdAt,
        },
      },
    );

    for (const it of items) {
      orderCountByDish.set(it.dish.toString(), (orderCountByDish.get(it.dish.toString()) || 0) + it.quantity);
    }
    created++;
  }

  if (orderCountByDish.size) {
    await Dish.bulkWrite(
      Array.from(orderCountByDish.entries()).map(([dishId, qty]) => ({
        updateOne: { filter: { _id: dishId }, update: { $inc: { orderCount: qty } } },
      })),
    );
  }

  console.log(`Created ${created} orders spread across the last ${DAYS_BACK} days.`);
  await mongoose.disconnect();
  console.log('Order seeding complete.');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
