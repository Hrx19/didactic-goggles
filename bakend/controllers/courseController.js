import Course from '../models/Course.js';
import Module from '../models/Module.js';
import Lesson from '../models/Lesson.js';
import { isDbConnected } from '../utils/userStore.js';

// Demo data served when database is not connected (for quick preview)
const demoCourses = [
  {
    _id: 'demo-1',
    title: 'Intro to Web Dev (Demo)',
    description: 'See how a course page looks. Replace this demo by adding real courses in MongoDB.',
    price: 0,
    thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
    instructor: { name: 'Kalchakra Team' },
    category: 'Web Development',
    level: 'beginner',
    duration: 2,
    previewVideo: 'https://www.youtube.com/embed/dMm5mQ21IxE',
    isPublished: true,
    modules: [
      {
        _id: 'demo-m1',
        title: 'Getting Started',
        lessons: [
          {
            _id: 'demo-l1',
            title: 'Welcome & Setup',
            duration: 10,
            isPreview: true,
          },
        ],
      },
    ],
    enrolledStudents: [],
    averageRating: 5,
    totalReviews: 1,
  },
];

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
export const getCourses = async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(200).json({
        success: true,
        count: demoCourses.length,
        data: demoCourses,
      });
    }

    const courses = await Course.find({ isPublished: true })
      .populate('instructor', 'name')
      .sort({ createdAt: -1 });

    if (!courses.length) {
      return res.status(200).json({
        success: true,
        count: demoCourses.length,
        data: demoCourses,
      });
    }

    res.status(200).json({ success: true, count: courses.length, data: courses });
  } catch (error) {
    console.error('Error in getCourses:', error);
    res.status(500).json({
      success: false,
      message: 'Database error. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
export const getCourse = async (req, res) => {
  try {
    if (!isDbConnected()) {
      const demo = demoCourses.find((c) => c._id === req.params.id);
      if (!demo) {
        return res.status(404).json({
          success: false,
          message: 'Course not found (database not connected)',
        });
      }
      return res.status(200).json({
        success: true,
        data: demo,
      });
    }

    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name')
      .populate({
        path: 'modules',
        populate: {
          path: 'lessons',
          select: 'title duration isPreview',
        },
      });

    if (!course) {
      // Fallback to demo course if DB has none
      const demo = demoCourses.find((c) => c._id === req.params.id) || demoCourses[0];
      return res.status(200).json({ success: true, data: demo });
    }

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create new course
// @route   POST /api/courses
// @access  Private/Admin
export const createCourse = async (req, res) => {
  if (!isDbConnected()) {
    return res.status(503).json({
      success: false,
      message: 'Database not connected',
    });
  }

  try {
    // Add user to req.body
    req.body.instructor = req.user.id;

    const course = await Course.create(req.body);

    res.status(201).json({
      success: true,
      data: course,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private/Admin
export const updateCourse = async (req, res) => {
  if (!isDbConnected()) {
    return res.status(503).json({
      success: false,
      message: 'Database not connected',
    });
  }

  try {
    let course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Make sure user is course owner or admin
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this course',
      });
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private/Admin
export const deleteCourse = async (req, res) => {
  if (!isDbConnected()) {
    return res.status(503).json({
      success: false,
      message: 'Database not connected',
    });
  }

  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Make sure user is course owner or admin
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this course',
      });
    }

    await course.remove();

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

// @desc    Get courses by instructor
// @route   GET /api/courses/instructor/:instructorId
// @access  Private
export const getCoursesByInstructor = async (req, res) => {
  if (!isDbConnected()) {
    return res.status(200).json({
      success: true,
      count: 0,
      data: [],
    });
  }

  try {
    const courses = await Course.find({
      instructor: req.params.instructorId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
