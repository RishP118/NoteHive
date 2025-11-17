const File = require('../models/File');
const Note = require('../models/Note');
const path = require('path');
const fs = require('fs');
const settings = require('../config/settings');

// @desc    Upload file
// @route   POST /api/files/upload
// @access  Private
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const { associatedNote, associatedGroup, tags } = req.body;

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
        $push: {
          attachments: {
            fileId: file._id,
            filename: req.file.originalname
          }
        }
      });
    }

    res.status(201).json({
      success: true,
      data: { file }
    });
  } catch (error) {
    console.error('Upload file error:', error);
    
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      error: 'Server error uploading file'
    });
  }
};

// @desc    Get all files
// @route   GET /api/files
// @access  Private
exports.getFiles = async (req, res) => {
  try {
    const { page = 1, limit = 10, associatedNote, associatedGroup } = req.query;
    const skip = (page - 1) * limit;

    const query = {
      $or: [
        { uploadedBy: req.user.id },
        { isPublic: true }
      ]
    };

    if (associatedNote) {
      query.associatedNote = associatedNote;
    }

    if (associatedGroup) {
      query.associatedGroup = associatedGroup;
    }

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
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Download file
// @route   GET /api/files/:id/download
// @access  Private
exports.downloadFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    // Check access
    const hasAccess = 
      file.uploadedBy.toString() === req.user.id ||
      file.isPublic;

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this file'
      });
    }

    // Check if file exists
    if (!fs.existsSync(file.path)) {
      return res.status(404).json({
        success: false,
        error: 'File not found on server'
      });
    }

    res.download(file.path, file.originalName);
  } catch (error) {
    console.error('Download file error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Delete file
// @route   DELETE /api/files/:id
// @access  Private
exports.deleteFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    // Only uploader can delete
    if (file.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this file'
      });
    }

    // Delete physical file
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    // Remove from note attachments if associated
    if (file.associatedNote) {
      await Note.findByIdAndUpdate(file.associatedNote, {
        $pull: { attachments: { fileId: file._id } }
      });
    }

    // Delete file record
    await file.deleteOne();

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

