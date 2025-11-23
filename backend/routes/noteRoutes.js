import { Router } from 'express';
import { body } from 'express-validator';
import { createNote, getNotes, getNote, updateNote, deleteNote, addCollaborator } from '../controllers/noteController.js';
import { protect } from '../middleware/authMiddleware.js';

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

router.route('/')
  .get(protect, getNotes)
  .post(protect, noteValidation, createNote);

router.route('/:id')
  .get(protect, getNote)
  .put(protect, updateNote)
  .delete(protect, deleteNote);

router.post('/:id/collaborators', protect, addCollaborator);

export default router;
