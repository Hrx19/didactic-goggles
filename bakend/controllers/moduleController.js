import Course from '../models/Course.js';
import Module from '../models/Module.js';
import { isDbConnected } from '../utils/userStore.js';

// @desc    Create module
// @route   POST /api/modules
// @access  Private (Instructor/Admin)
export const createModule = async (req, res) => {
  if (!isDbConnected()) {
    return res.status(503).json({
      success: false,
      message: 'Database not connected',
    });
  }

  try {
    const { courseId, title, order } = req.body;
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add modules for this course',
      });
    }

    const module = await Module.create({
      title,
      course: courseId,
      order: order || 1,
    });

    course.modules.push(module._id);
    await course.save();

    res.status(201).json({
      success: true,
      data: module,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update module
// @route   PUT /api/modules/:id
// @access  Private (Instructor/Admin)
export const updateModule = async (req, res) => {
  if (!isDbConnected()) {
    return res.status(503).json({
      success: false,
      message: 'Database not connected',
    });
  }

  try {
    const module = await Module.findById(req.params.id).populate('course');
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found',
      });
    }

    if (module.course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this module',
      });
    }

    module.title = req.body.title || module.title;
    module.order = req.body.order ?? module.order;
    await module.save();

    res.status(200).json({
      success: true,
      data: module,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete module
// @route   DELETE /api/modules/:id
// @access  Private (Instructor/Admin)
export const deleteModule = async (req, res) => {
  if (!isDbConnected()) {
    return res.status(503).json({
      success: false,
      message: 'Database not connected',
    });
  }

  try {
    const module = await Module.findById(req.params.id).populate('course');
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found',
      });
    }

    if (module.course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this module',
      });
    }

    await Module.findByIdAndDelete(req.params.id);

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
