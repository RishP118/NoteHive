import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Note title is required'], trim: true, maxlength: [200, 'Title cannot exceed 200 characters'] },
  content: { type: String, required: [true, 'Note content is required'] },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  tags: [{ type: String, trim: true, lowercase: true }],
  subject: { type: String, trim: true },
  isPublic: { type: Boolean, default: false },
  collaborators: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['viewer', 'editor'], default: 'viewer' },
    addedAt: { type: Date, default: Date.now }
  }],
  attachments: [{
    fileId: { type: mongoose.Schema.Types.ObjectId, ref: 'File' },
    filename: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  studyGroupId: { type: mongoose.Schema.Types.ObjectId, ref: 'StudyGroup', index: true },
  version: { type: Number, default: 1 },
  lastEditedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  editHistory: [{
    content: String,
    editedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    editedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

noteSchema.index({ title: 'text', content: 'text', tags: 'text' });
noteSchema.index({ userId: 1, createdAt: -1 });
noteSchema.index({ tags: 1 });
noteSchema.index({ subject: 1 });
noteSchema.index({ studyGroupId: 1 });

export default mongoose.model('Note', noteSchema);
