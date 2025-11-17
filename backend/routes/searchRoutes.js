const express = require('express');
const router = express.Router();
const {
  searchNotes,
  searchFiles,
  globalSearch
} = require('../controllers/searchController');
const { protect } = require('../middleware/authMiddleware');

// Routes
router.get('/notes', protect, searchNotes);
router.get('/files', protect, searchFiles);
router.get('/', protect, globalSearch);

module.exports = router;

