import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  createQuiz,
  getQuizByCourse,
  submitQuiz,
  getCertificates,
} from '../controllers/quizController.js';

const router = express.Router();

router.post('/', protect, authorize('admin', 'instructor'), createQuiz);
router.get('/course/:courseId', protect, getQuizByCourse);
router.post('/:quizId/submit', protect, submitQuiz);
router.get('/certificates', protect, getCertificates);

export default router;
