import multer from 'multer';
import { UPLOAD_DIR, MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from '../config/settings.js';
import fs from 'fs';
import path from 'path';

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (ALLOWED_FILE_TYPES.includes(file.mimetype)) cb(null, true);
  else cb(new Error('File type not allowed'), false);
};

const multerUpload = multer({ storage, limits: { fileSize: MAX_FILE_SIZE }, fileFilter });

export const uploadSingle = (req, res, next) => {
  multerUpload.single('file')(req, res, (err) => {
    if (err) {
      return handleUploadError(err, req, res, next);
    }
    next();
  });
};

export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, error: 'File size exceeds limit' });
    }
    return res.status(400).json({ success: false, error: err.message });
  }
  res.status(400).json({ success: false, error: err.message || 'File upload error' });
};
