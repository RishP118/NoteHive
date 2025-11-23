import { Router } from 'express';
import { body } from 'express-validator';
import { registerUser, loginUser, getMe, updateProfile } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('username').trim().isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 chars'),
  body('email').isEmail().normalizeEmail().withMessage('Provide valid email'),
  body('role').isIn(['student', 'teacher']).withMessage('Role must be student or teacher'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 chars')
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Provide valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

router.post('/register', registerValidation, registerUser);
router.post('/login', loginValidation, loginUser);
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);

export default router;
