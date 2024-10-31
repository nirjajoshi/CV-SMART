// models/resume.models.js
import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  file_name: {
    type: String,
    required: true,
  },
  file_type: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  posted_date: {
    type: Date,
    default: Date.now,
  },
  common_id: {
    type: String,
    default: 'cvsmart',
  },
  embeddings: {
    type: [Number], // Assuming embeddings are stored as an array of numbers
    required: true,
  },
  cloudinary_url: {
    type: String,
    required: true,
  },
});

const Resume = mongoose.model('Resume', resumeSchema);

export { Resume };
