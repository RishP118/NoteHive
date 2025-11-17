const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  createNote,
  getNotes,
  getNote,
  updateNote,
  deleteNote,
  addCollaborator
} = require('../controllers/noteController');
const { protect } = require('../middleware/authMiddleware');

// Validation rules
const noteValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('content')
    .notEmpty()
    .withMessage('Content is required')
];

// Routes
router.route('/')
  .get(protect, getNotes)
  .post(protect, noteValidation, createNote);

router.route('/:id')
  .get(protect, getNote)
  .put(protect, updateNote)
  .delete(protect, deleteNote);

router.post('/:id/collaborators', protect, addCollaborator);

module.exports = router;

