import Notification from '../models/Notification.js';

export async function notifyUser(userId, { type = 'system', title, message, link }) {
  return Notification.create({ user: userId, type, title, message, link });
}
