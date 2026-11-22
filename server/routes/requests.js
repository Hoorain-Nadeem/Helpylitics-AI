import { Router } from 'express';
import HelpRequest from '../models/Request.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { categorize, suggestTags, detectUrgency, summarize } from '../utils/ai.js';
import { notify } from '../utils/notify.js';
import { rewardHelper } from '../utils/trust.js';

const router = Router();
const esc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const withRefs = (q) => q
  .populate('author', 'name trustScore location')
  .populate('helpers.user', 'name trustScore skills')
  .populate('solvedBy', 'name');

router.get('/', protect, async (req, res) => {
  const { category, urgency, status, location, skill, q, mine, helping, author, solvedBy, limit } = req.query;
  const f = {};
  if (category) f.category = category;
  if (urgency) f.urgency = urgency;
  if (status) f.status = status;
  if (location) f.location = new RegExp(esc(location), 'i');
  if (skill) f.tags = new RegExp(esc(skill), 'i');
  if (q) f.$or = [{ title: new RegExp(esc(q), 'i') }, { description: new RegExp(esc(q), 'i') }];
  if (mine === '1') f.author = req.user._id;
  if (helping === '1') f['helpers.user'] = req.user._id;
  if (author) f.author = author;
  if (solvedBy) f.solvedBy = solvedBy;
  res.json(await withRefs(HelpRequest.find(f).sort({ createdAt: -1 }).limit(Number(limit) || 100)));
});

router.post('/', protect, async (req, res) => {
  const { title, description, tags, category, urgency, location } = req.body;
  if (!title?.trim() || !description?.trim()) return res.status(400).json({ message: 'Title and description are required' });
  const text = `${title} ${description}`;
  const cat = category || categorize(text);
  const urg = urgency || detectUrgency(text);
  const finalTags = tags?.length ? tags.map((t) => t.toLowerCase()) : suggestTags(text);
  const doc = await HelpRequest.create({
    title: title.trim(), description, category: cat, urgency: urg, tags: finalTags,
    location: location || req.user.location || 'Remote',
    summary: summarize(description, cat, urg), author: req.user._id,
  });

  if (finalTags.length) {
    const matchers = finalTags.map((t) => new RegExp(`^${esc(t)}$`, 'i'));
    const people = await User.find({ _id: { $ne: req.user._id }, skills: { $in: matchers }, role: { $ne: 'need' } }).limit(20);
    await Promise.all(people.map((p) => notify(p._id, 'new_request', `New request matches your skills: ${doc.title}`, `/requests/${doc._id}`)));
  }
  res.status(201).json(await withRefs(HelpRequest.findById(doc._id)));
});

router.get('/:id', protect, async (req, res) => {
  const doc = await withRefs(HelpRequest.findById(req.params.id));
  if (!doc) return res.status(404).json({ message: 'Request not found' });
  res.json(doc);
});

router.post('/:id/help', protect, async (req, res) => {
  const r = await HelpRequest.findById(req.params.id);
  if (!r) return res.status(404).json({ message: 'Request not found' });
  if (r.author.equals(req.user._id)) return res.status(400).json({ message: 'You cannot help on your own request' });
  if (r.status === 'solved') return res.status(400).json({ message: 'This request is already solved' });
  if (r.helpers.some((h) => h.user.equals(req.user._id))) return res.status(400).json({ message: 'You already offered help' });
  r.helpers.push({ user: req.user._id });
  r.status = 'in_progress';
  await r.save();
  await notify(r.author, 'help_offer', `${req.user.name} offered to help with "${r.title}"`, `/requests/${r._id}`);
  res.json(await withRefs(HelpRequest.findById(r._id)));
});

router.post('/:id/solve', protect, async (req, res) => {
  const r = await HelpRequest.findById(req.params.id);
  if (!r) return res.status(404).json({ message: 'Request not found' });
  if (!r.author.equals(req.user._id) && !req.user.isAdmin) return res.status(403).json({ message: 'Only the author can mark this as solved' });
  if (r.status === 'solved') return res.status(400).json({ message: 'Already solved' });
  const { helperId } = req.body;
  if (helperId && !r.helpers.some((h) => h.user.equals(helperId))) return res.status(400).json({ message: 'That user is not a helper on this request' });

  r.status = 'solved';
  r.solvedAt = new Date();
  if (helperId) r.solvedBy = helperId;
  await r.save();

  for (const h of r.helpers) {
    if (helperId && h.user.equals(helperId)) {
      const helper = await User.findById(helperId);
      const pts = await rewardHelper(helper, r.urgency);
      await notify(helper._id, 'solved', `"${r.title}" was marked solved thanks to you. +${pts} points, +5 trust`, `/requests/${r._id}`);
    } else {
      await notify(h.user, 'status', `"${r.title}" was marked as solved`, `/requests/${r._id}`);
    }
  }
  res.json(await withRefs(HelpRequest.findById(r._id)));
});

router.delete('/:id', protect, async (req, res) => {
  const r = await HelpRequest.findById(req.params.id);
  if (!r) return res.status(404).json({ message: 'Request not found' });
  if (!r.author.equals(req.user._id) && !req.user.isAdmin) return res.status(403).json({ message: 'Not allowed' });
  await r.deleteOne();
  res.json({ ok: true });
});

export default router;
