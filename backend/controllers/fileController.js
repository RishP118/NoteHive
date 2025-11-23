import File from '../models/File.js';
import Note from '../models/Note.js';
import path from 'path';
import fs from 'fs';
import {
  UPLOAD_DIR,
  MAX_FILE_SIZE,
  ALLOWED_FILE_TYPES
} from '../config/settings.js';

// @desc    Upload file
// @route   POST /api/files/upload
// @access  Private
export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const { associatedNote, associatedGroup, tags } = req.body;

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(req.file.mimetype)) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, error: 'File type not allowed' });
    }

    // Validate file size
    if (req.file.size > MAX_FILE_SIZE) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, error: 'File size exceeds limit' });
    }

    // Create file record
    const file = await File.create({
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      url: `/uploads/${req.file.filename}`,
      uploadedBy: req.user.id,
      associatedNote: associatedNote || null,
      associatedGroup: associatedGroup || null,
      tags: tags ? (Array.isArray(tags) ? tags : [tags]) : []
    });

    // If associated with note, add to note's attachments
    if (associatedNote) {
      await Note.findByIdAndUpdate(associatedNote, {
        $push: { attachments: { fileId: file._id, filename: req.file.originalname } }
      });
    }

    res.status(201).json({ success: true, data: { file } });
  } catch (error) {
    console.error('Upload file error:', error);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ success: false, error: 'Server error uploading file' });
  }
};

// @desc    Get all files
// @route   GET /api/files
// @access  Private
export const getFiles = async (req, res) => {
  try {
    const { page = 1, limit = 10, associatedNote, associatedGroup } = req.query;
    const skip = (page - 1) * limit;

    const query = {
      $or: [{ uploadedBy: req.user.id }, { isPublic: true }]
    };

    if (associatedNote) query.associatedNote = associatedNote;
    if (associatedGroup) query.associatedGroup = associatedGroup;

    const files = await File.find(query)
      .populate('uploadedBy', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await File.countDocuments(query);

    res.json({
      success: true,
      data: {
        files,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// @desc    Download file
// @route   GET /api/files/:id/download
// @access  Private
export const downloadFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) return res.status(404).json({ success: false, error: 'File not found' });

    const hasAccess = file.uploadedBy.toString() === req.user.id || file.isPublic;
    if (!hasAccess) return res.status(403).json({ success: false, error: 'Not authorized' });

    if (!fs.existsSync(file.path)) return res.status(404).json({ success: false, error: 'File not found on server' });

    res.download(file.path, file.originalName);
  } catch (error) {
    console.error('Download file error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// @desc    Delete file
// @route   DELETE /api/files/:id
// @access  Private
export const deleteFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ success: false, error: 'File not found' });

    if (file.uploadedBy.toString() !== req.user.id)
      return res.status(403).json({ success: false, error: 'Not authorized to delete this file' });

    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);

    if (file.associatedNote) {
      await Note.findByIdAndUpdate(file.associatedNote, { $pull: { attachments: { fileId: file._id } } });
    }

    await file.deleteOne();

    res.json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
