const Note = require('../models/Note');
const { validationResult } = require('express-validator');

// @desc    Create new note
// @route   POST /api/notes
// @access  Private
exports.createNote = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { title, content, tags, subject, isPublic, studyGroupId } = req.body;

    const note = await Note.create({
      title,
      content,
      tags: tags || [],
      subject,
      isPublic: isPublic || false,
      userId: req.user.id,
      studyGroupId: studyGroupId || null,
      lastEditedBy: req.user.id
    });

    res.status(201).json({
      success: true,
      data: { note }
    });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error creating note'
    });
  }
};

// @desc    Get all notes
// @route   GET /api/notes
// @access  Private
exports.getNotes = async (req, res) => {
  try {
    const { page = 1, limit = 10, tags, subject, search, studyGroupId } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    const query = {
      $or: [
        { userId: req.user.id },
        { 'collaborators.userId': req.user.id },
        { isPublic: true }
      ]
    };

    if (studyGroupId) {
      query.studyGroupId = studyGroupId;
    }

    if (tags) {
      query.tags = { $in: Array.isArray(tags) ? tags : [tags] };
    }

    if (subject) {
      query.subject = subject;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const notes = await Note.find(query)
      .populate('userId', 'username email profile')
      .populate('lastEditedBy', 'username')
      .sort(search ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Note.countDocuments(query);

    res.json({
      success: true,
      data: {
        notes,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching notes'
    });
  }
};

// @desc    Get single note
// @route   GET /api/notes/:id
// @access  Private
exports.getNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id)
      .populate('userId', 'username email profile')
      .populate('collaborators.userId', 'username email')
      .populate('lastEditedBy', 'username')
      .populate('attachments.fileId');

    if (!note) {
      return res.status(404).json({
        success: false,
        error: 'Note not found'
      });
    }

    // Check access
    const hasAccess = 
      note.userId.toString() === req.user.id ||
      note.collaborators.some(c => c.userId.toString() === req.user.id) ||
      note.isPublic;

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this note'
      });
    }

    res.json({
      success: true,
      data: { note }
    });
  } catch (error) {
    console.error('Get note error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Update note
// @route   PUT /api/notes/:id
// @access  Private
exports.updateNote = async (req, res) => {
  try {
    const { title, content, tags, subject, isPublic } = req.body;

    let note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        error: 'Note not found'
      });
    }

    // Check permissions
    const isOwner = note.userId.toString() === req.user.id;
    const isCollaborator = note.collaborators.some(
      c => c.userId.toString() === req.user.id && c.role === 'editor'
    );

    if (!isOwner && !isCollaborator) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to edit this note'
      });
    }

    // Save to edit history
    note.editHistory.push({
      content: note.content,
      editedBy: req.user.id,
      editedAt: new Date()
    });

    // Update note
    note.title = title || note.title;
    note.content = content || note.content;
    note.tags = tags || note.tags;
    note.subject = subject || note.subject;
    note.isPublic = isPublic !== undefined ? isPublic : note.isPublic;
    note.lastEditedBy = req.user.id;
    note.version += 1;

    await note.save();

    res.json({
      success: true,
      data: { note }
    });
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error updating note'
    });
  }
};

// @desc    Delete note
// @route   DELETE /api/notes/:id
// @access  Private
exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        error: 'Note not found'
      });
    }

    // Only owner can delete
    if (note.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this note'
      });
    }

    await note.deleteOne();

    res.json({
      success: true,
      message: 'Note deleted successfully'
    });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error deleting note'
    });
  }
};

// @desc    Add collaborator to note
// @route   POST /api/notes/:id/collaborators
// @access  Private
exports.addCollaborator = async (req, res) => {
  try {
    const { userId, role = 'viewer' } = req.body;

    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        error: 'Note not found'
      });
    }

    // Only owner can add collaborators
    if (note.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to add collaborators'
      });
    }

    // Check if already a collaborator
    const existing = note.collaborators.find(
      c => c.userId.toString() === userId
    );

    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'User is already a collaborator'
      });
    }

    note.collaborators.push({
      userId,
      role
    });

    await note.save();

    res.json({
      success: true,
      data: { note }
    });
  } catch (error) {
    console.error('Add collaborator error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

