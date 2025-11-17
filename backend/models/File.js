const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  associatedNote: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Note',
    index: true
  },
  associatedGroup: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudyGroup',
    index: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for search
fileSchema.index({ filename: 'text', originalName: 'text', tags: 'text' });
fileSchema.index({ uploadedBy: 1, createdAt: -1 });
fileSchema.index({ mimeType: 1 });

module.exports = mongoose.model('File', fileSchema);

