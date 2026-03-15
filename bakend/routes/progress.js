import express from 'express';
import { getProgress, updateProgress } from '../controllers/progressController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/:courseId', protect, getProgress);
router.post('/:courseId', protect, updateProgress);

export default router;
