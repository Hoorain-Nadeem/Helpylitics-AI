import Notification from '../models/Notification.js';
let io;
export const setIO = (instance) => { io = instance; };
export const getIO = () => io;

export async function notify(userId, type, text, link = '') {
  const n = await Notification.create({ user: userId, type, text, link });
  io?.to(`user:${userId}`).emit('notification', n);
  return n;
}
