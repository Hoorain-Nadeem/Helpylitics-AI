import { Router } from 'express';
import Message from '../models/Message.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { getIO } from '../utils/notify.js';

const router = Router();

router.get('/conversations', protect, async (req, res) => {
  const me = String(req.user._id);
  const msgs = await Message.find({ $or: [{ from: me }, { to: me }] }).sort({ createdAt: -1 }).limit(500);
  const map = new Map();
  for (const m of msgs) {
    const other = String(m.from) === me ? String(m.to) : String(m.from);
    if (!map.has(other)) map.set(other, { userId: other, last: m, unread: 0 });
    if (String(m.to) === me && !m.read) map.get(other).unread++;
  }
  const users = await User.find({ _id: { $in: [...map.keys()] } }).select('name trustScore');
  const byId = Object.fromEntries(users.map((u) => [String(u._id), u]));
  res.json([...map.values()].map((c) => ({ ...c, user: byId[c.userId] })).filter((c) => c.user));
});

router.get('/:userId', protect, async (req, res) => {
  const me = req.user._id, other = req.params.userId;
  await Message.updateMany({ from: other, to: me, read: false }, { read: true });
  res.json(await Message.find({ $or: [{ from: me, to: other }, { from: other, to: me }] }).sort({ createdAt: 1 }));
});

router.post('/', protect, async (req, res) => {
  const { to, text, request } = req.body;
  if (!to || !text?.trim()) return res.status(400).json({ message: 'Recipient and message are required' });
  const m = await Message.create({ from: req.user._id, to, text: text.trim(), request });
  getIO()?.to(`user:${to}`).emit('message', m);
  res.status(201).json(m);
});

export default router;
