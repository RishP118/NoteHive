import mongoose from 'mongoose';


const collaborationSessionSchema = new mongoose.Schema({
  noteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Note',
    required: true,
    index: true
  },
  meetingId: {
    type: String
  },
  joinUrl: {
    type: String
  },
  startUrl: {
    type: String
  },
  title: {
    type: String
  },
  date: {
    type: String
  },
  time: {
    type: String
  },
  duration: {
    type: Number
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  activeUsers: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    socketId: String,
    joinedAt: {
      type: Date,
      default: Date.now
    },
    cursorPosition: {
      line: Number,
      column: Number
    }
  }],
  lastActivity: {
    type: Date,
    default: Date.now,
    index: true
  }
}, { timestamps: true });

// TTL index to auto-delete stale sessions after 1 hour
collaborationSessionSchema.index({ lastActivity: 1 }, { expireAfterSeconds: 3600 });

export default mongoose.model('CollaborationSession', collaborationSessionSchema);

