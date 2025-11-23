import StudyGroup from '../models/StudyGroup.js';
import User from '../models/User.js';
import { validationResult } from 'express-validator';

export const createGroup = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { name, description, isPublic, allowInvites } = req.body;

    const group = await StudyGroup.create({
      name,
      description,
      createdBy: req.user.id,
      members: [{ userId: req.user.id, role: 'admin' }],
      settings: { isPublic: isPublic || false, allowInvites: allowInvites !== undefined ? allowInvites : true }
    });

    await User.findByIdAndUpdate(req.user.id, { $push: { studyGroups: group._id } });

    res.status(201).json({ success: true, data: { group } });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ success: false, error: 'Server error creating group' });
  }
};

export const getGroups = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const query = { $or: [{ 'members.userId': req.user.id }, { createdBy: req.user.id }, { 'settings.isPublic': true }] };

    const groups = await StudyGroup.find(query)
      .populate('createdBy', 'username email')
      .populate('members.userId', 'username email profile')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await StudyGroup.countDocuments(query);

    res.json({
      success: true,
      data: { groups, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) } }
    });
  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

export const getGroup = async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id)
      .populate('createdBy', 'username email profile')
      .populate('members.userId', 'username email profile')
      .populate('notes', 'title createdAt')
      .populate('invitations.invitedUser', 'username email');

    if (!group) return res.status(404).json({ success: false, error: 'Group not found' });

    const isMember = group.members.some(m => m.userId._id.toString() === req.user.id);
    const isPublic = group.settings.isPublic;
    if (!isMember && !isPublic) return res.status(403).json({ success: false, error: 'Not authorized to access this group' });

    res.json({ success: true, data: { group } });
  } catch (error) {
    console.error('Get group error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

export const joinGroup = async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ success: false, error: 'Group not found' });

    const isMember = group.members.some(m => m.userId.toString() === req.user.id);
    if (isMember) return res.status(400).json({ success: false, error: 'Already a member of this group' });

    if (group.members.length >= group.settings.maxMembers) return res.status(400).json({ success: false, error: 'Group is full' });

    group.members.push({ userId: req.user.id, role: 'member' });
    await group.save();

    await User.findByIdAndUpdate(req.user.id, { $push: { studyGroups: group._id } });

    res.json({ success: true, message: 'Successfully joined group', data: { group } });
  } catch (error) {
    console.error('Join group error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

export const inviteUser = async (req, res) => {
  try {
    const { email } = req.body;
    const group = await StudyGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ success: false, error: 'Group not found' });

    const isAdmin = group.members.some(m => m.userId.toString() === req.user.id && m.role === 'admin');
    if (!isAdmin && group.createdBy.toString() !== req.user.id) return res.status(403).json({ success: false, error: 'Not authorized to invite users' });

    const invitedUser = await User.findOne({ email });
    if (!invitedUser) return res.status(404).json({ success: false, error: 'User not found' });

    const isMember = group.members.some(m => m.userId.toString() === invitedUser._id.toString());
    if (isMember) return res.status(400).json({ success: false, error: 'User is already a member' });

    group.invitations.push({ invitedBy: req.user.id, invitedUser: invitedUser._id, status: 'pending' });
    await group.save();

    res.json({ success: true, message: 'Invitation sent', data: { group } });
  } catch (error) {
    console.error('Invite user error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
