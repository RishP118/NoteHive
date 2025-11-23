import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import * as settings from '../config/settings.js';

export const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) return res.status(401).json({ success: false, error: 'Not authorized' });

    try {
      const decoded = jwt.verify(token, settings.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) return res.status(401).json({ success: false, error: 'User not found' });
      if (!req.user.isActive) return res.status(401).json({ success: false, error: 'User account is deactivated' });

      next();
    } catch (err) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Server error during authentication' });
  }
};

export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, error: `User role '${req.user.role}' not authorized` });
  }
  next();
};

export const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      try {
        const decoded = jwt.verify(token, settings.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
      } catch (err) {
        req.user = null;
      }
    }
    next();
  } catch {
    next();
  }
};
