const express = require('express');
const router = express.Router();
const {
  uploadFile,
  getFiles,
  downloadFile,
  deleteFile
} = require('../controllers/fileController');
const { protect } = require('../middleware/authMiddleware');
const { uploadSingle, handleUploadError } = require('../middleware/uploadMiddleware');

// Routes
router.route('/')
  .get(protect, getFiles)
  .post(protect, uploadSingle('file'), handleUploadError, uploadFile);

router.get('/:id/download', protect, downloadFile);
router.delete('/:id', protect, deleteFile);

module.exports = router;

