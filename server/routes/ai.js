import { Router } from 'express';
import HelpRequest from '../models/Request.js';
import { protect } from '../middleware/auth.js';
import { analyze, suggestForOnboarding } from '../utils/ai.js';

const router = Router();

router.post('/analyze', protect, (req, res) => {
  res.json(analyze(req.body.title || '', req.body.description || ''));
});

router.post('/onboarding', protect, (req, res) => {
  res.json(suggestForOnboarding(req.body.skills || [], req.body.interests || []));
});

router.get('/insights', protect, async (req, res) => {
  const since = new Date(Date.now() - 14 * 864e5);
  const all = await HelpRequest.find().select('title category tags urgency status helpers author createdAt');
  const recent = all.filter((r) => r.createdAt >= since);

  const count = (arr) => Object.entries(arr.reduce((m, k) => ((m[k] = (m[k] || 0) + 1), m), {}))
    .map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  const trendingCategories = count(recent.map((r) => r.category)).slice(0, 6);
  const topTags = count(recent.flatMap((r) => r.tags)).slice(0, 10);
  const open = all.filter((r) => r.status !== 'solved');
  const urgentOpen = open.filter((r) => r.urgency === 'High').length;
  const unanswered = open.filter((r) => r.helpers.length === 0).length;
  const solved = all.filter((r) => r.status === 'solved').length;
  const solvedRate = all.length ? Math.round((solved / all.length) * 100) : 0;

  const mySkills = req.user.skills.map((s) => s.toLowerCase());
  const matches = open
    .filter((r) => !r.author.equals(req.user._id) && r.tags.some((t) => mySkills.includes(t.toLowerCase())))
    .slice(0, 5).map((r) => ({ _id: r._id, title: r.title, urgency: r.urgency, category: r.category }));

  const suggestions = [];
  if (urgentOpen) suggestions.push(`${urgentOpen} urgent request${urgentOpen > 1 ? 's are' : ' is'} still open. Pick one you can solve in 15 minutes.`);
  if (trendingCategories[0]) suggestions.push(`${trendingCategories[0].name} is trending with ${trendingCategories[0].value} new requests in the last 14 days.`);
  if (unanswered) suggestions.push(`${unanswered} request${unanswered > 1 ? 's have' : ' has'} no helper yet. Be the first to reply.`);
  if (req.user.skills.length < 3) suggestions.push('Add at least 3 skills to your profile to get better request matches.');
  if (!suggestions.length) suggestions.push('The community is caught up. Post a request or share a skill.');

  res.json({ trendingCategories, topTags, urgentOpen, unanswered, solvedRate, total: all.length, matches, suggestions });
});

export default router;
