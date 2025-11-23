import CollaborationSession from '../models/CollaborationSession.js';
import { validationResult } from 'express-validator';

export const createSession = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { noteId, meetingId, joinUrl, startUrl, title, date, time, duration, createdBy } = req.body;
    const session = await CollaborationSession.create({
      noteId,
      meetingId,
      joinUrl,
      startUrl,
      title,
      date,
      time,
      duration,
      createdBy,
      lastActivity: new Date()
    });
    res.status(201).json({ success: true, data: { session } });
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ success: false, error: 'Server error creating session' });
  }
};
