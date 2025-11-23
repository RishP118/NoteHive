import express from 'express';
import http from 'http';
import { Server as SocketIO } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import 'dotenv/config.js';
import * as settings from './config/settings.js';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import groupRoutes from './routes/groupRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import zoomRoutes from './routes/zoomRoutes.js';
import collaborationService from './services/collaborationService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

const io = new SocketIO(server, {
  cors: {
    origin: true, // Allow all origins for development
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Connect to MongoDB
connectDB();

// Security & Middleware
app.use(helmet());
app.use(cors({
  origin: true, // Allow all origins for development
  credentials: true
}));



const limiter = rateLimit({
  windowMs: settings.RATE_LIMIT_WINDOW,
  max: settings.RATE_LIMIT_MAX,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static uploads
const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) fs.mkdirSync(uploadsPath, { recursive: true });
app.use('/uploads', express.static(uploadsPath));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'NoteHive backend is running', timestamp: new Date().toISOString() });
});

// Root route
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Welcome to NoteHive backend!' });
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/zoom', zoomRoutes);
import sessionRoutes from './routes/sessionRoutes.js';
app.use('/api/session', sessionRoutes);

// 404 handler (keep at the end)
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// --- Socket.IO JWT Authentication ---
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication error: Token missing'));
    const decoded = jwt.verify(token, settings.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    next(new Error('Authentication error: Invalid token'));
  }
});

// --- Socket.IO Collaboration ---
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.userId}, socket ID: ${socket.id}`);

  socket.on('join-note', async (noteId) => {
    try {
      socket.join(`note-${noteId}`);
      await collaborationService.addUserToSession(noteId, socket.userId, socket.id);
      const activeUsers = await collaborationService.getActiveUsers(noteId);
      io.to(`note-${noteId}`).emit('user-joined', { userId: socket.userId, activeUsers });
    } catch (error) {
      console.error('Error joining note:', error);
    }
  });

  socket.on('note-edit', async ({ noteId, changes, cursorPosition }) => {
    try {
      if (cursorPosition) {
        await collaborationService.updateCursor(noteId, socket.userId, socket.id, cursorPosition);
      }
      socket.to(`note-${noteId}`).emit('note-updated', { changes, userId: socket.userId, cursorPosition });
    } catch (error) {
      console.error('Error handling note edit:', error);
    }
  });

  socket.on('cursor-move', async ({ noteId, cursorPosition }) => {
    try {
      await collaborationService.updateCursor(noteId, socket.userId, socket.id, cursorPosition);
      socket.to(`note-${noteId}`).emit('cursor-updated', { userId: socket.userId, cursorPosition });
    } catch (error) {
      console.error('Error handling cursor move:', error);
    }
  });

  socket.on('leave-note', async (noteId) => {
    try {
      socket.leave(`note-${noteId}`);
      await collaborationService.removeUserFromSession(noteId, socket.userId, socket.id);
      const activeUsers = await collaborationService.getActiveUsers(noteId);
      io.to(`note-${noteId}`).emit('user-left', { userId: socket.userId, activeUsers });
    } catch (error) {
      console.error('Error leaving note:', error);
    }
  });

  socket.on('disconnect', async () => {
    console.log(`User disconnected: ${socket.userId}, socket ID: ${socket.id}`);
    try {
      const sessions = await collaborationService.getAllSessionsForUser(socket.userId);
      for (const session of sessions) {
        await collaborationService.removeUserFromSession(session.noteId, socket.userId, socket.id);
        const activeUsers = await collaborationService.getActiveUsers(session.noteId);
        io.to(`note-${session.noteId}`).emit('user-left', { userId: socket.userId, activeUsers });
      }
    } catch (error) {
      console.error('Error during disconnect cleanup:', error);
    }
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({ success: false, error: err.message || 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Start server
server.listen(settings.PORT || 3000, () => {
  console.log(`🚀 NoteHive backend running on http://localhost:${settings.PORT || 3000}`);
  console.log(`📋 Health check: http://localhost:${settings.PORT || 3000}/health`);
  console.log(`🔌 Socket.io ready for real-time collaboration`);
});

export { app, server, io };
