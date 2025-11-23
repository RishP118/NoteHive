import { Router } from 'express';
import { searchNotes, searchFiles, globalSearch } from '../controllers/searchController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/notes', protect, searchNotes);
router.get('/files', protect, searchFiles);
router.get('/', protect, globalSearch);

export default router;
