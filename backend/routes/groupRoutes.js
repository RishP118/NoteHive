import { Router } from 'express';
import { body } from 'express-validator';
import { createGroup, getGroups, getGroup, joinGroup, inviteUser } from '../controllers/groupController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

const groupValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Group name is required')
    .isLength({ max: 100 })
    .withMessage('Group name cannot exceed 100 characters')
];

router.route('/')
  .get(protect, getGroups)
  .post(protect, groupValidation, createGroup);

router.route('/:id')
  .get(protect, getGroup);

router.post('/:id/join', protect, joinGroup);
router.post('/:id/invite', protect, [body('email').isEmail().withMessage('Valid email is required')], inviteUser);

export default router;
