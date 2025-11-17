const CollaborationSession = require('../models/CollaborationSession');
const Note = require('../models/Note');

// Get or create collaboration session
exports.getOrCreateSession = async (noteId) => {
  let session = await CollaborationSession.findOne({ noteId });
  
  if (!session) {
    session = await CollaborationSession.create({ noteId });
  }
  
  return session;
};

// Add user to session
exports.addUserToSession = async (noteId, userId, socketId) => {
  const session = await this.getOrCreateSession(noteId);
  
  // Remove if already exists
  session.activeUsers = session.activeUsers.filter(
    u => u.userId.toString() !== userId.toString()
  );
  
  // Add user
  session.activeUsers.push({
    userId,
    socketId,
    joinedAt: new Date()
  });
  
  session.lastActivity = new Date();
  await session.save();
  
  return session;
};

// Remove user from session
exports.removeUserFromSession = async (noteId, userId, socketId) => {
  const session = await CollaborationSession.findOne({ noteId });
  
  if (session) {
    session.activeUsers = session.activeUsers.filter(
      u => u.socketId !== socketId && u.userId.toString() !== userId.toString()
    );
    
    session.lastActivity = new Date();
    await session.save();
  }
  
  return session;
};

// Update cursor position
exports.updateCursor = async (noteId, userId, socketId, cursorPosition) => {
  const session = await CollaborationSession.findOne({ noteId });
  
  if (session) {
    const user = session.activeUsers.find(
      u => u.socketId === socketId || u.userId.toString() === userId.toString()
    );
    
    if (user) {
      user.cursorPosition = cursorPosition;
      session.lastActivity = new Date();
      await session.save();
    }
  }
  
  return session;
};

// Get active users for a note
exports.getActiveUsers = async (noteId) => {
  const session = await CollaborationSession.findOne({ noteId })
    .populate('activeUsers.userId', 'username email profile');
  
  return session ? session.activeUsers : [];
};

