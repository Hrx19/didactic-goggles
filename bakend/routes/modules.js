import express from 'express';
import { createModule, updateModule, deleteModule } from '../controllers/moduleController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, authorize('admin', 'instructor'), createModule);
router.put('/:id', protect, authorize('admin', 'instructor'), updateModule);
router.delete('/:id', protect, authorize('admin', 'instructor'), deleteModule);

export default router;
