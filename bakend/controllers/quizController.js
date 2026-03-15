import Course from '../models/Course.js';
import Quiz from '../models/Quiz.js';
import QuizAttempt from '../models/QuizAttempt.js';
import Certificate from '../models/Certificate.js';
import { isDbConnected } from '../utils/userStore.js';

const ensureEnrolled = async (course, userId) => {
  return course.enrolledStudents.some((id) => id.toString() === userId);
};

// @desc    Create quiz
// @route   POST /api/quizzes
// @access  Private (Instructor/Admin)
export const createQuiz = async (req, res) => {
  if (!isDbConnected()) {
    return res.status(503).json({ success: false, message: 'Database not connected' });
  }

  try {
    const { courseId, title, passingScore, questions } = req.body;
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to create quiz' });
    }

    const quiz = await Quiz.create({
      course: courseId,
      title,
      passingScore: passingScore ?? 70,
      questions,
    });

    res.status(201).json({ success: true, data: quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get quiz by course
// @route   GET /api/quizzes/course/:courseId
// @access  Private
export const getQuizByCourse = async (req, res) => {
  if (!isDbConnected()) {
    return res.status(200).json({ success: true, data: null });
  }

  try {
    const quiz = await Quiz.findOne({ course: req.params.courseId }).lean();
    res.status(200).json({ success: true, data: quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit quiz attempt
// @route   POST /api/quizzes/:quizId/submit
// @access  Private
export const submitQuiz = async (req, res) => {
  if (!isDbConnected()) {
    return res.status(503).json({ success: false, message: 'Database not connected' });
  }

  try {
    const { answers } = req.body;
    const quiz = await Quiz.findById(req.params.quizId).populate('course');

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    const enrolled = await ensureEnrolled(quiz.course, req.user.id);
    if (!enrolled && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Enroll to take this quiz' });
    }

    const correctCount = quiz.questions.reduce((total, q, index) => {
      return total + (answers?.[index] === q.correctIndex ? 1 : 0);
    }, 0);

    const score = quiz.questions.length
      ? Math.round((correctCount / quiz.questions.length) * 100)
      : 0;
    const passed = score >= quiz.passingScore;

    const attempt = await QuizAttempt.create({
      user: req.user.id,
      course: quiz.course._id,
      quiz: quiz._id,
      score,
      passed,
      answers,
    });

    let certificate = null;
    if (passed) {
      const existing = await Certificate.findOne({ user: req.user.id, course: quiz.course._id });
      if (!existing) {
        certificate = await Certificate.create({
          user: req.user.id,
          course: quiz.course._id,
          certificateId: `CERT-${quiz.course._id}-${Date.now()}`,
        });
      } else {
        certificate = existing;
      }
    }

    res.status(200).json({
      success: true,
      data: { attempt, certificate },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user certificates
// @route   GET /api/quizzes/certificates
// @access  Private
export const getCertificates = async (req, res) => {
  if (!isDbConnected()) {
    return res.status(200).json({ success: true, data: [] });
  }

  try {
    const certificates = await Certificate.find({ user: req.user.id }).populate('course', 'title');
    res.status(200).json({ success: true, data: certificates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
