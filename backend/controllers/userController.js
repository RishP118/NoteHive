import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import * as settings from '../config/settings.js';

// @desc    Register new user
export const registerUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { name, username, email, password, role } = req.body;
    const normalizedEmail = (email || '').trim().toLowerCase();

    if (!name || !username || !normalizedEmail || !password || !role)
      return res.status(400).json({ message: 'Please fill all fields' });

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) return res.status(400).json({ message: 'Email already in use' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      username,
      email: normalizedEmail,
      password: hashedPassword,
      role
    });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      settings.JWT_SECRET,
      { expiresIn: settings.JWT_EXPIRE }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: user._id, name: user.name, username: user.username, email: user.email, role: user.role }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

// @desc    Login user
export const loginUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { email, password } = req.body;
    console.log('Login attempt - email:', email ? email.substring(0, 3) + '***' : 'missing');
    const normalizedEmail = (email || '').trim().toLowerCase();

    if (!normalizedEmail || !password)
      return res.status(400).json({ message: 'Please provide email and password' });

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      console.log('User not found for email:', normalizedEmail);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password mismatch for user:', normalizedEmail);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      settings.JWT_SECRET,
      { expiresIn: settings.JWT_EXPIRE }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, username: user.username, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get current logged-in user
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      user: { id: user._id, name: user.name, username: user.username, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { name, username, role } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { name, username, role },
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Profile updated successfully',
      user: { id: updatedUser._id, name: updatedUser.name, username: updatedUser.username, email: updatedUser.email, role: updatedUser.role }
    });
  } catch (error) {
    console.error('UpdateProfile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
