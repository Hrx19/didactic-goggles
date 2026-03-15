import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  prompt: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctIndex: { type: Number, required: true },
});

const quizSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  title: { type: String, required: true },
  passingScore: { type: Number, default: 70, min: 0, max: 100 },
  questions: [questionSchema],
}, { timestamps: true });

const Quiz = mongoose.model('Quiz', quizSchema);

export default Quiz;
