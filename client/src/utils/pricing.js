const TAX_RATE = 0.08;
const BASE_DELIVERY_FEE = 4.99;
const FREE_DELIVERY_THRESHOLD = 50;

export function calculateCartTotals(items, { deliveryType = 'delivery', coupon } = {}) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * TAX_RATE;

  const discount = coupon?.freeDelivery ? 0 : coupon?.discount || 0;
  const freeDelivery = coupon?.freeDelivery || subtotal >= FREE_DELIVERY_THRESHOLD;
  const deliveryFee = deliveryType === 'delivery' && !freeDelivery ? BASE_DELIVERY_FEE : 0;

  const total = Math.max(subtotal + tax + deliveryFee - discount, 0);

  return { subtotal, tax, deliveryFee, discount, total };
}
