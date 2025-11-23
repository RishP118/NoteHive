import { Router } from 'express';
import { body } from 'express-validator';
import { createSession } from '../controllers/sessionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

const sessionValidation = [
  body('noteId').notEmpty().withMessage('Note ID is required'),
  body('meetingId').notEmpty().withMessage('Meeting ID is required'),
  body('joinUrl').notEmpty().withMessage('Join URL is required'),
  body('startUrl').notEmpty().withMessage('Start URL is required'),
  body('title').notEmpty().withMessage('Title is required'),
  body('date').notEmpty().withMessage('Date is required'),
  body('time').notEmpty().withMessage('Time is required'),
  body('duration').notEmpty().withMessage('Duration is required'),
  body('createdBy').notEmpty().withMessage('CreatedBy is required')
];

router.post('/create-session', protect, sessionValidation, createSession);

export default router;
