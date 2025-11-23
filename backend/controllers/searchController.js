import Note from '../models/Note.js';
import File from '../models/File.js';
import StudyGroup from '../models/StudyGroup.js';

export const searchNotes = async (req, res) => {
  try {
    const { q, tags, subject, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const query = { $or: [{ userId: req.user.id }, { 'collaborators.userId': req.user.id }, { isPublic: true }] };
    if (q) query.$text = { $search: q };
    if (tags) query.tags = { $in: (Array.isArray(tags) ? tags : tags.split(',')).map(t => t.trim().toLowerCase()) };
    if (subject) query.subject = subject;

    const notes = await Note.find(query)
      .populate('userId', 'username email')
      .sort(q ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Note.countDocuments(query);

    res.json({ success: true, data: { notes, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) } } });
  } catch (error) {
    console.error('Search notes error:', error);
    res.status(500).json({ success: false, error: 'Server error searching notes' });
  }
};

export const searchFiles = async (req, res) => {
  try {
    const { q, tags, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const query = { $or: [{ uploadedBy: req.user.id }, { isPublic: true }] };
    if (q) query.$text = { $search: q };
    if (tags) query.tags = { $in: (Array.isArray(tags) ? tags : tags.split(',')).map(t => t.trim().toLowerCase()) };

    const files = await File.find(query)
      .populate('uploadedBy', 'username email')
      .sort(q ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await File.countDocuments(query);

    res.json({ success: true, data: { files, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) } } });
  } catch (error) {
    console.error('Search files error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

export const globalSearch = async (req, res) => {
  try {
    const { q, type = 'all', page = 1, limit = 5 } = req.query;
    if (!q) return res.status(400).json({ success: false, error: 'Search query is required' });

    const results = { notes: [], files: [], groups: [] };

    if (type === 'all' || type === 'notes') {
      const noteQuery = { $text: { $search: q }, $or: [{ userId: req.user.id }, { 'collaborators.userId': req.user.id }, { isPublic: true }] };
      results.notes = await Note.find(noteQuery).populate('userId', 'username email').sort({ score: { $meta: 'textScore' } }).limit(parseInt(limit));
    }

    if (type === 'all' || type === 'files') {
      const fileQuery = { $text: { $search: q }, $or: [{ uploadedBy: req.user.id }, { isPublic: true }] };
      results.files = await File.find(fileQuery).populate('uploadedBy', 'username email').sort({ score: { $meta: 'textScore' } }).limit(parseInt(limit));
    }

    if (type === 'all' || type === 'groups') {
      const groupQuery = {
        $or: [{ name: { $regex: q, $options: 'i' } }, { description: { $regex: q, $options: 'i' } }],
        $or: [{ 'members.userId': req.user.id }, { createdBy: req.user.id }, { 'settings.isPublic': true }]
      };
      results.groups = await StudyGroup.find(groupQuery).populate('createdBy', 'username email').limit(parseInt(limit));
    }

    res.json({ success: true, data: results });
  } catch (error) {
    console.error('Global search error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
