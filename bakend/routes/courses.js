import express from 'express';
import {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  getCoursesByInstructor,
} from '../controllers/courseController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router
  .route('/')
  .get(getCourses)
  .post(protect, authorize('admin', 'instructor'), createCourse);

router
  .route('/:id')
  .get(getCourse)
  .put(protect, authorize('admin', 'instructor'), updateCourse)
  .delete(protect, authorize('admin', 'instructor'), deleteCourse);

router.get('/instructor/:instructorId', protect, getCoursesByInstructor);

export default router;
