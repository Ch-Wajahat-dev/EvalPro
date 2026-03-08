const mongoose = require('mongoose');

const rubricSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Rubric title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  criteria: [
    {
      name: { type: String, required: true },
      maxScore: { type: Number, required: true },
      description: { type: String, default: '' }
    }
  ],
  discountPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  image: {
    type: String,
    default: ''
  },
  endTime: {
    type: Date,
    required: [true, 'Deadline is required']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Rubric', rubricSchema);
