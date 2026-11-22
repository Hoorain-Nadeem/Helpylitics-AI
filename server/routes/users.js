import { Router } from 'express';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/leaderboard', protect, async (req, res) => {
  const users = await User.find({ isAdmin: false })
    .sort({ points: -1, trustScore: -1 }).limit(20)
    .select('name skills trustScore points helpedCount badges location');
  res.json(users);
});

router.put('/me', protect, async (req, res) => {
  const allowed = ['name', 'skills', 'interests', 'location', 'bio', 'role', 'onboarded'];
  for (const k of allowed) if (req.body[k] !== undefined) req.user[k] = req.body[k];
  await req.user.save();
  res.json(req.user);
});

router.get('/:id', protect, async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

export default router;
