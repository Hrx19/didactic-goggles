import express from 'express';
import { createLesson, updateLesson, deleteLesson } from '../controllers/lessonController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, authorize('admin', 'instructor'), createLesson);
router.put('/:id', protect, authorize('admin', 'instructor'), updateLesson);
router.delete('/:id', protect, authorize('admin', 'instructor'), deleteLesson);

export default router;
