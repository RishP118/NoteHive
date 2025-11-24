import Note from '../models/Note.js';
import { validationResult } from 'express-validator';

export const createNote = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { title, content, tags, subject, isPublic, studyGroupId } = req.body;

    const note = await Note.create({
      title,
      content,
      tags: tags || [],
      subject,
      isPublic: isPublic !== undefined ? isPublic : false, // Use provided value, default to false 
      userId: req.user.id,
      studyGroupId: studyGroupId || null,
      lastEditedBy: req.user.id
    });

    res.status(201).json({ success: true, data: { note } });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ success: false, error: 'Server error creating note' });
  }
};

export const getNotes = async (req, res) => {
  try {
    const { page = 1, limit = 10, tags, subject, search, studyGroupId } = req.query;
    const skip = (page - 1) * limit;

    // Build query - if user is authenticated, show their notes + public notes
    // If not authenticated, show only public notes
    const query = req.user 
      ? { $or: [{ userId: req.user.id }, { 'collaborators.userId': req.user.id }, { isPublic: true }] }
      : { isPublic: true };
    
    if (studyGroupId) query.studyGroupId = studyGroupId;
    if (tags) query.tags = { $in: Array.isArray(tags) ? tags : [tags] };
    if (subject) query.subject = subject;
    if (search) query.$text = { $search: search };

    const notes = await Note.find(query)
      .populate('userId', 'username email profile')
      .populate('lastEditedBy', 'username')
      .sort(search ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Note.countDocuments(query);

    res.json({ success: true, data: { notes, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) } } });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ success: false, error: 'Server error fetching notes' });
  }
};

export const getNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id)
      .populate('userId', 'username email profile')
      .populate('collaborators.userId', 'username email')
      .populate('lastEditedBy', 'username')
      .populate('attachments.fileId');

    if (!note) return res.status(404).json({ success: false, error: 'Note not found' });

    // Check access - more permissive logic:
    // 1. If note is public, anyone can access
    // 2. If user is authenticated and owns the note, allow access
    // 3. If user is authenticated and is a collaborator, allow access
    let hasAccess = false;
    
    if (note.isPublic) {
      hasAccess = true;
    } else if (req.user) {
      hasAccess = note.userId.toString() === req.user.id ||
                  note.collaborators.some(c => c.userId && c.userId.toString() === req.user.id);
    }

    if (!hasAccess) {
      return res.status(403).json({ 
        success: false, 
        error: 'Not authorized to access this note. Note is private and you are not the owner or collaborator.' 
      });
    }

    res.json({ success: true, data: { note } });
  } catch (error) {
    console.error('Get note error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

export const updateNote = async (req, res) => {
  try {
    const { title, content, tags, subject, isPublic } = req.body;
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ success: false, error: 'Note not found' });

    const isOwner = note.userId.toString() === req.user.id;
    const isCollaborator = note.collaborators.some(c => c.userId.toString() === req.user.id && c.role === 'editor');
    if (!isOwner && !isCollaborator) return res.status(403).json({ success: false, error: 'Not authorized to edit this note' });

    note.editHistory.push({ content: note.content, editedBy: req.user.id, editedAt: new Date() });
    note.title = title || note.title;
    note.content = content || note.content;
    note.tags = tags || note.tags;
    note.subject = subject || note.subject;
    note.isPublic = isPublic !== undefined ? isPublic : note.isPublic;
    note.lastEditedBy = req.user.id;
    note.version += 1;

    await note.save();
    res.json({ success: true, data: { note } });
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ success: false, error: 'Server error updating note' });
  }
};

export const deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ success: false, error: 'Note not found' });
    if (note.userId.toString() !== req.user.id) return res.status(403).json({ success: false, error: 'Not authorized to delete this note' });

    await note.deleteOne();
    res.json({ success: true, message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

export const addCollaborator = async (req, res) => {
  try {
    const { userId, role = 'viewer' } = req.body;
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ success: false, error: 'Note not found' });
    if (note.userId.toString() !== req.user.id) return res.status(403).json({ success: false, error: 'Not authorized to add collaborators' });

    const existing = note.collaborators.find(c => c.userId.toString() === userId);
    if (existing) return res.status(400).json({ success: false, error: 'User is already a collaborator' });

    note.collaborators.push({ userId, role });
    await note.save();
    res.json({ success: true, data: { note } });
  } catch (error) {
    console.error('Add collaborator error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
