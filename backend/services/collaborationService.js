import CollaborationSession from '../models/CollaborationSession.js';
import Note from '../models/Note.js';

const collaborationService = {
  createSession: async (noteId) => {
    const session = await CollaborationSession.create({ noteId });
    return session;
  },

  addUserToSession: async (noteId, userId, socketId) => {
    let session = await CollaborationSession.findOne({ noteId });

    if (!session) {
      session = await CollaborationSession.create({ noteId, activeUsers: [] });
    }

    const existingUser = session.activeUsers.find(
      (u) => u.userId.toString() === userId.toString()
    );

    if (existingUser) {
      existingUser.socketId = socketId;
      existingUser.joinedAt = new Date();
    } else {
      session.activeUsers.push({ userId, socketId, joinedAt: new Date() });
    }

    session.lastActivity = new Date();
    await session.save();

    return session;
  },

  removeUserFromSession: async (noteId, userId, socketId) => {
    const session = await CollaborationSession.findOne({ noteId });
    if (!session) return null;

    session.activeUsers = session.activeUsers.filter(
      (u) => u.userId.toString() !== userId.toString() || u.socketId !== socketId
    );

    session.lastActivity = new Date();
    await session.save();

    return session;
  },

  updateCursor: async (noteId, userId, socketId, cursorPosition) => {
    const session = await CollaborationSession.findOne({ noteId });
    if (!session) return null;

    const user = session.activeUsers.find(
      (u) => u.userId.toString() === userId.toString() && u.socketId === socketId
    );

    if (user) {
      user.cursorPosition = cursorPosition;
      session.lastActivity = new Date();
      await session.save();
    }

    return session;
  },

  getActiveUsers: async (noteId) => {
    const session = await CollaborationSession.findOne({ noteId }).populate(
      'activeUsers.userId',
      'username email'
    );
    if (!session) return [];
    return session.activeUsers.map((u) => ({
      userId: u.userId._id,
      username: u.userId.username,
      email: u.userId.email,
      cursorPosition: u.cursorPosition || null
    }));
  },

  endSession: async (noteId) => {
    return await CollaborationSession.findOneAndDelete({ noteId });
  }
};

export default collaborationService;
