import { Router } from 'express';
import { body } from 'express-validator';
import { createNote, getNotes, getNote, updateNote, deleteNote, addCollaborator } from '../controllers/noteController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';

const router = Router();

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

// Use optionalAuth for GET to allow viewing notes without auth (for development) 
// Use protect for POST/PUT/DELETE to require auth for modifications
router.route('/')
  .get(optionalAuth, getNotes)
  .post(protect, noteValidation, createNote);

router.route('/:id')
  .get(optionalAuth, getNote)
  .put(protect, updateNote)
  .delete(protect, deleteNote);

router.post('/:id/collaborators', protect, addCollaborator);

export default router;
