import express from 'express';
import { uploadSingle, handleUploadError } from '../middleware/uploadMiddleware.js';
import { uploadFile, getFiles, downloadFile, deleteFile } from '../controllers/fileController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Handle CORS preflight for upload
router.options('/upload', (req, res) => {
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(200);
});

// Upload file (no auth required for demo/local dev) 
// Must be defined before /:id routes to avoid route conflicts
router.post('/upload', uploadSingle, async (req, res, next) => {
  try {
    await uploadFile(req, res);
  } catch (error) {
    next(error);
  }
});

// Get all files
router.get('/', protect, getFiles);

// Download file
router.get('/:id/download', protect, downloadFile);

// Delete file
router.delete('/:id', protect, deleteFile);

export default router;
