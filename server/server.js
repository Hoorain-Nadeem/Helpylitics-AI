import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import { setIO } from './utils/notify.js';
import User from './models/User.js';
import HelpRequest from './models/Request.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import requestRoutes from './routes/requests.js';
import aiRoutes from './routes/ai.js';
import messageRoutes from './routes/messages.js';
import notificationRoutes from './routes/notifications.js';
import adminRoutes from './routes/admin.js';

const app = express();
const server = http.createServer(app);
const origin = process.env.CLIENT_URL || 'http://localhost:5173';
const io = new Server(server, { cors: { origin } });

io.use((socket, next) => {
  try {
    const { id } = jwt.verify(socket.handshake.auth.token, process.env.JWT_SECRET);
    socket.userId = id;
    next();
  } catch { next(new Error('unauthorized')); }
});
io.on('connection', (socket) => socket.join(`user:${socket.userId}`));
setIO(io);

app.use(cors({ origin }));
app.use(express.json());

app.get('/api/stats', async (req, res) => {
  const [members, requests, solved, helpers] = await Promise.all([
    User.countDocuments(), HelpRequest.countDocuments(),
    HelpRequest.countDocuments({ status: 'solved' }), User.countDocuments({ helpedCount: { $gt: 0 } }),
  ]);
  res.json({ members, requests, solved, helpers });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.name === 'CastError' ? 400 : 500).json({ message: err.name === 'CastError' ? 'Invalid id' : 'Server error' });
});

const PORT = process.env.PORT || 5000;
connectDB().then(() => server.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`)))
  .catch((e) => { console.error('DB connection failed', e.message); process.exit(1); });
