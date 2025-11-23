import express from 'express';
import { uploadSingle, handleUploadError } from '../middleware/uploadMiddleware.js';
import { uploadFile, getFiles, downloadFile, deleteFile } from '../controllers/fileController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Upload file (no auth required for demo/local dev)
router.post('/upload', (req, res, next) => {
  uploadSingle(req, res, (err) => {
    if (err) return handleUploadError(err, req, res, next);
    uploadFile(req, res);
  });
});

// Get all files
router.get('/', protect, getFiles);

// Download file
router.get('/:id/download', protect, downloadFile);

// Delete file
router.delete('/:id', protect, deleteFile);

export default router;
