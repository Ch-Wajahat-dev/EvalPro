const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  score: {
    type: Number,
    required: [true, 'Score/Points is required'],
    min: 0,
    max: 100
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Web Application', 'Mobile Application', 'AI/ML', 'IoT', 'Data Science', 'Desktop Application']
  },
  image: {
    type: String,
    default: ''
  },
  document: {
    type: String,
    default: ''
  },
  inStatus: {
    type: Boolean,
    default: true
  },
  studentName: {
    type: String,
    default: ''
  },
  proposedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  approvalStatus: {
    type: String,
    enum: ['approved', 'pending', 'rejected'],
    default: 'approved'
  },
  rejectionNote: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
