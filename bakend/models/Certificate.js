import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  certificateId: { type: String, required: true, unique: true },
  issuedAt: { type: Date, default: Date.now },
}, { timestamps: true });

const Certificate = mongoose.model('Certificate', certificateSchema);

export default Certificate;
