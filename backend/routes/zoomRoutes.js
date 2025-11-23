import { Router } from 'express';
import { body } from 'express-validator';
import zoomService from '../services/zoomService.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

const meetingValidation = [
  body('title').trim().notEmpty().withMessage('Meeting title is required'),
  body('date').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Invalid date format. Use YYYY-MM-DD'),
  body('time').matches(/^\d{2}:\d{2}$/).withMessage('Invalid time format. Use HH:MM')
];

router.post('/create-meeting', protect, meetingValidation, async (req, res) => {
  try {
    const { title, date, time, duration } = req.body;
    const meetingDateTime = new Date(`${date}T${time}:00`);
    if (meetingDateTime < new Date()) {
      return res.status(400).json({ success: false, error: 'Meeting time must be in the future' });
    }
    const result = await zoomService.createMeeting({ title, date, time, duration });
    if (result.success) res.json(result);
    else res.status(500).json(result);
  } catch (error) {
    console.error('Error in create-meeting endpoint:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
