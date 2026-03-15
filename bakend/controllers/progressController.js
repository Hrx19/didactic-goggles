import Course from '../models/Course.js';
import Progress from '../models/Progress.js';
import { isDbConnected } from '../utils/userStore.js';

const countLessons = (course) => {
  if (!course?.modules?.length) return 0;
  return course.modules.reduce((total, module) => total + (module.lessons?.length || 0), 0);
};

// @desc    Get progress for a course
// @route   GET /api/progress/:courseId
// @access  Private
export const getProgress = async (req, res) => {
  if (!isDbConnected()) {
    return res.status(200).json({
      success: true,
      data: { progressPercent: 0, completedLessons: [] },
    });
  }

  try {
    const progress = await Progress.findOne({
      user: req.user.id,
      course: req.params.courseId,
    }).lean();

    res.status(200).json({
      success: true,
      data: progress || { progressPercent: 0, completedLessons: [] },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update progress for a course
// @route   POST /api/progress/:courseId
// @access  Private
export const updateProgress = async (req, res) => {
  if (!isDbConnected()) {
    return res.status(503).json({
      success: false,
      message: 'Database not connected',
    });
  }

  try {
    const { lessonId, completed = true } = req.body;

    const course = await Course.findById(req.params.courseId).populate({
      path: 'modules',
      populate: { path: 'lessons', select: '_id' },
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    const totalLessons = countLessons(course);

    let progress = await Progress.findOne({
      user: req.user.id,
      course: course._id,
    });

    if (!progress) {
      progress = await Progress.create({
        user: req.user.id,
        course: course._id,
        completedLessons: [],
        progressPercent: 0,
      });
    }

    if (lessonId) {
      const exists = progress.completedLessons.some((id) => id.toString() === lessonId);
      if (completed && !exists) {
        progress.completedLessons.push(lessonId);
      }
      if (!completed && exists) {
        progress.completedLessons = progress.completedLessons.filter((id) => id.toString() !== lessonId);
      }
      progress.lastLesson = lessonId;
    }

    const completedCount = progress.completedLessons.length;
    progress.progressPercent = totalLessons ? Math.round((completedCount / totalLessons) * 100) : 0;

    await progress.save();

    res.status(200).json({
      success: true,
      data: progress,
      totalLessons,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
