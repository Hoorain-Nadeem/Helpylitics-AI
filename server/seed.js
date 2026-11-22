import 'dotenv/config';
import connectDB from './config/db.js';
import User from './models/User.js';
import HelpRequest from './models/Request.js';
import Notification from './models/Notification.js';
import Message from './models/Message.js';
import { analyze } from './utils/ai.js';
import { computeBadges } from './utils/trust.js';

await connectDB();
await Promise.all([User.deleteMany(), HelpRequest.deleteMany(), Notification.deleteMany(), Message.deleteMany()]);

const mk = (d) => { const u = new User({ password: 'password123', onboarded: true, ...d }); u.badges = computeBadges(u); return u.save(); };
const admin = await mk({ name: 'Admin', email: 'admin@helplytics.ai', password: 'admin123', isAdmin: true, role: 'both' });
const ayesha = await mk({ name: 'Ayesha Khan', email: 'ayesha@demo.com', role: 'help', skills: ['react', 'javascript', 'css'], interests: ['system design'], location: 'Karachi', trustScore: 92, points: 180, helpedCount: 16 });
const bilal = await mk({ name: 'Bilal Ahmed', email: 'bilal@demo.com', role: 'both', skills: ['python', 'sql', 'pandas'], interests: ['react'], location: 'Lahore', trustScore: 78, points: 90, helpedCount: 7 });
const sara = await mk({ name: 'Sara Ali', email: 'sara@demo.com', role: 'need', skills: ['figma'], interests: ['react', 'interview'], location: 'Karachi', trustScore: 55, points: 10, helpedCount: 1 });
const hamza = await mk({ name: 'Hamza Raza', email: 'hamza@demo.com', role: 'both', skills: ['node', 'express', 'mongodb', 'docker'], interests: ['figma'], location: 'Islamabad', trustScore: 70, points: 60, helpedCount: 5 });

const samples = [
  [sara, 'React useEffect runs twice', 'My useEffect fetch is firing twice in development and I am stuck. I need to fix this before my project deadline tomorrow.', 'Karachi'],
  [sara, 'Mock interview practice', 'I have a frontend interview next week and want someone to run a mock interview and review my resume.', 'Remote'],
  [bilal, 'Deploy MERN app with Docker', 'I need help to deploy my express and mongodb backend with docker to aws. Server keeps crashing.', 'Remote'],
  [hamza, 'Figma auto layout feedback', 'Can someone review my figma prototype and wireframe for a landing page design? Not urgent.', 'Islamabad'],
  [bilal, 'Pandas groupby confusion', 'I am confused about pandas groupby with multiple aggregations for my data assignment due this week.', 'Lahore'],
];
for (const [author, title, description, location] of samples) {
  const a = analyze(title, description);
  await HelpRequest.create({ title, description, location, author: author._id, category: a.category, urgency: a.urgency, tags: a.tags, summary: a.summary });
}
const first = await HelpRequest.findOne({ title: /useEffect/ });
first.helpers.push({ user: ayesha._id }); first.status = 'in_progress'; await first.save();
await Notification.create({ user: sara._id, type: 'help_offer', text: 'Ayesha Khan offered to help with "React useEffect runs twice"', link: `/requests/${first._id}` });

console.log('Seeded. Logins: ayesha@demo.com / password123, sara@demo.com / password123, admin@helplytics.ai / admin123');
process.exit(0);
