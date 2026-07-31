export const APP_NAME = 'Savoria';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const ORDER_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  PREPARING: 'preparing',
  READY: 'ready',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
};

export const RESERVATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
};

export const USER_ROLES = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
  MANAGER: 'manager',
  CHEF: 'chef',
  WAITER: 'waiter',
  CASHIER: 'cashier',
  RIDER: 'rider',
};

export const DIETARY_TAGS = {
  VEGETARIAN: 'vegetarian',
  VEGAN: 'vegan',
  HALAL: 'halal',
};
