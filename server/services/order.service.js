const TAX_RATE = 0.08;
const BASE_DELIVERY_FEE = 4.99;
const FREE_DELIVERY_THRESHOLD = 50;

export function calculateTotals({ subtotal, deliveryType, discount = 0, freeDelivery = false }) {
  const tax = Number((subtotal * TAX_RATE).toFixed(2));

  let deliveryFee = 0;
  if (deliveryType === 'delivery') {
    deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD || freeDelivery ? 0 : BASE_DELIVERY_FEE;
  }

  const total = Number((subtotal + tax + deliveryFee - discount).toFixed(2));

  return { tax, deliveryFee, total: Math.max(total, 0) };
}

export function generateOrderNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SV-${timestamp}-${random}`;
}
