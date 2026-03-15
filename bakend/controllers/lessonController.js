import Lesson from '../models/Lesson.js';
import Module from '../models/Module.js';
import { isDbConnected } from '../utils/userStore.js';

// @desc    Create lesson
// @route   POST /api/lessons
// @access  Private (Instructor/Admin)
export const createLesson = async (req, res) => {
  if (!isDbConnected()) {
    return res.status(503).json({
      success: false,
      message: 'Database not connected',
    });
  }

  try {
    const { moduleId, title, videoUrl, duration, order, isPreview } = req.body;
    const module = await Module.findById(moduleId).populate('course');

    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found',
      });
    }

    if (module.course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add lessons to this module',
      });
    }

    const lesson = await Lesson.create({
      title,
      module: moduleId,
      videoUrl,
      duration,
      order: order || 1,
      isPreview: !!isPreview,
    });

    module.lessons.push(lesson._id);
    await module.save();

    res.status(201).json({
      success: true,
      data: lesson,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update lesson
// @route   PUT /api/lessons/:id
// @access  Private (Instructor/Admin)
export const updateLesson = async (req, res) => {
  if (!isDbConnected()) {
    return res.status(503).json({
      success: false,
      message: 'Database not connected',
    });
  }

  try {
    const lesson = await Lesson.findById(req.params.id).populate({
      path: 'module',
      populate: { path: 'course' },
    });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found',
      });
    }

    if (lesson.module.course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this lesson',
      });
    }

    lesson.title = req.body.title || lesson.title;
    lesson.videoUrl = req.body.videoUrl || lesson.videoUrl;
    lesson.duration = req.body.duration ?? lesson.duration;
    lesson.order = req.body.order ?? lesson.order;
    lesson.isPreview = req.body.isPreview ?? lesson.isPreview;
    await lesson.save();

    res.status(200).json({
      success: true,
      data: lesson,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete lesson
// @route   DELETE /api/lessons/:id
// @access  Private (Instructor/Admin)
export const deleteLesson = async (req, res) => {
  if (!isDbConnected()) {
    return res.status(503).json({
      success: false,
      message: 'Database not connected',
    });
  }

  try {
    const lesson = await Lesson.findById(req.params.id).populate({
      path: 'module',
      populate: { path: 'course' },
    });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found',
      });
    }

    if (lesson.module.course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this lesson',
      });
    }

    await Lesson.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
