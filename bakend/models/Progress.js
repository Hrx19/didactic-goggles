import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  completedLessons: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
  }],
  lastLesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
  },
  progressPercent: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
}, {
  timestamps: true,
});

progressSchema.index({ user: 1, course: 1 }, { unique: true });

const Progress = mongoose.model('Progress', progressSchema);

export default Progress;
