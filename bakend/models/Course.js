import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a course title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: 0,
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  thumbnail: {
    type: String, // URL to thumbnail image
    required: [true, 'Please add a thumbnail'],
  },
  modules: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
  }],
  category: {
    type: String,
    required: [true, 'Please add a category'],
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner',
  },
  duration: {
    type: Number, // in hours
    required: [true, 'Please add duration'],
  },
  previewVideo: {
    type: String, // YouTube URL or video URL
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
  enrolledStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  totalReviews: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Calculate average rating
courseSchema.methods.calculateAverageRating = function() {
  // This will be implemented when reviews are added
};

const Course = mongoose.model('Course', courseSchema);

export default Course;