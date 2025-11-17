const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

// Load environment variables
require('dotenv').config();

// Import configurations
const connectDB = require('./config/db');
const settings = require('./config/settings');

// Import routes
const userRoutes = require('./routes/userRoutes');
const noteRoutes = require('./routes/noteRoutes');
const groupRoutes = require('./routes/groupRoutes');
const fileRoutes = require('./routes/fileRoutes');
const searchRoutes = require('./routes/searchRoutes');
const zoomRoutes = require('./routes/zoomRoutes');

// Import services
const collaborationService = require('./services/collaborationService');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.io for real-time collaboration
const io = socketIo(server, {
  cors: {
    origin: settings.CORS_ORIGIN,
    methods: ['GET', 'POST']
  }
});

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: settings.CORS_ORIGIN,
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: settings.RATE_LIMIT_WINDOW,
  max: settings.RATE_LIMIT_MAX,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files
const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsPath));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'NoteHive backend is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/zoom', zoomRoutes);

// Socket.io connection handling for real-time collaboration
io.use(async (socket, next) => {
  try {
    // In production, verify JWT token here
    // For now, we'll use a simple auth mechanism
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
    // TODO: Verify JWT token and attach user to socket
    socket.userId = socket.handshake.auth.userId; // Temporary
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join note room for collaboration
  socket.on('join-note', async (noteId) => {
    try {
      socket.join(`note-${noteId}`);
      
      if (socket.userId) {
        await collaborationService.addUserToSession(noteId, socket.userId, socket.id);
        
        // Notify others in the room
        const activeUsers = await collaborationService.getActiveUsers(noteId);
        io.to(`note-${noteId}`).emit('user-joined', {
          userId: socket.userId,
          activeUsers
        });
      }
    } catch (error) {
      console.error('Error joining note:', error);
    }
  });

  // Handle note edits
  socket.on('note-edit', async (data) => {
    try {
      const { noteId, changes, cursorPosition } = data;
      
      // Update cursor position
      if (socket.userId && cursorPosition) {
        await collaborationService.updateCursor(noteId, socket.userId, socket.id, cursorPosition);
      }
      
      // Broadcast changes to other users in the room (except sender)
      socket.to(`note-${noteId}`).emit('note-updated', {
        changes,
        userId: socket.userId,
        cursorPosition
      });
    } catch (error) {
      console.error('Error handling note edit:', error);
    }
  });

  // Handle cursor movement
  socket.on('cursor-move', async (data) => {
    try {
      const { noteId, cursorPosition } = data;
      
      if (socket.userId) {
        await collaborationService.updateCursor(noteId, socket.userId, socket.id, cursorPosition);
        
        // Broadcast cursor position
        socket.to(`note-${noteId}`).emit('cursor-updated', {
          userId: socket.userId,
          cursorPosition
        });
      }
    } catch (error) {
      console.error('Error handling cursor move:', error);
    }
  });

  // Leave note room
  socket.on('leave-note', async (noteId) => {
    try {
      socket.leave(`note-${noteId}`);
      
      if (socket.userId) {
        await collaborationService.removeUserFromSession(noteId, socket.userId, socket.id);
        
        // Notify others
        const activeUsers = await collaborationService.getActiveUsers(noteId);
        io.to(`note-${noteId}`).emit('user-left', {
          userId: socket.userId,
          activeUsers
        });
      }
    } catch (error) {
      console.error('Error leaving note:', error);
    }
  });

  // Handle disconnect
  socket.on('disconnect', async () => {
    console.log(`User disconnected: ${socket.id}`);
    // Clean up sessions on disconnect
    // This would require tracking which notes the user was in
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Start server
const PORT = settings.PORT;
server.listen(PORT, () => {
  console.log(`🚀 NoteHive backend server running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`🔌 Socket.io ready for real-time collaboration`);
  
  if (!settings.ZOOM_ACCOUNT_ID || !settings.ZOOM_CLIENT_ID || !settings.ZOOM_CLIENT_SECRET) {
    console.warn('⚠️  Warning: Zoom credentials not configured. Please set up .env file.');
  }
  
  if (!process.env.MONGODB_URI) {
    console.warn('⚠️  Warning: MongoDB URI not configured. Using default local connection.');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

module.exports = { app, server, io };
