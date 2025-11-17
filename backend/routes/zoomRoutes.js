const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const zoomService = require('../services/zoomService');
const { protect } = require('../middleware/authMiddleware');

// Validation rules
const meetingValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Meeting title is required'),
  body('date')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Invalid date format. Use YYYY-MM-DD'),
  body('time')
    .matches(/^\d{2}:\d{2}$/)
    .withMessage('Invalid time format. Use HH:MM')
];

// Create Zoom meeting endpoint
router.post('/create-meeting', protect, meetingValidation, async (req, res) => {
  try {
    const { title, date, time, duration } = req.body;

    // Validate date is in the future
    const meetingDateTime = new Date(`${date}T${time}:00`);
    if (meetingDateTime < new Date()) {
      return res.status(400).json({
        success: false,
        error: 'Meeting time must be in the future'
      });
    }

    const result = await zoomService.createMeeting({ title, date, time, duration });
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('Error in create-meeting endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;

