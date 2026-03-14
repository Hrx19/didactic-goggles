import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a lesson title'],
    trim: true,
  },
  module: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
    required: true,
  },
  videoUrl: {
    type: String, // YouTube private link or cloud storage URL
    required: [true, 'Please add a video URL'],
  },
  duration: {
    type: Number, // in minutes
    required: [true, 'Please add duration'],
  },
  order: {
    type: Number,
    required: true,
  },
  isPreview: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

const Lesson = mongoose.model('Lesson', lessonSchema);

export default Lesson;