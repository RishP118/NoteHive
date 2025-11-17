const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  createGroup,
  getGroups,
  getGroup,
  joinGroup,
  inviteUser
} = require('../controllers/groupController');
const { protect } = require('../middleware/authMiddleware');

// Validation rules
const groupValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Group name is required')
    .isLength({ max: 100 })
    .withMessage('Group name cannot exceed 100 characters')
];

// Routes
router.route('/')
  .get(protect, getGroups)
  .post(protect, groupValidation, createGroup);

router.route('/:id')
  .get(protect, getGroup);

router.post('/:id/join', protect, joinGroup);
router.post('/:id/invite', protect, [
  body('email').isEmail().withMessage('Valid email is required')
], inviteUser);

module.exports = router;

