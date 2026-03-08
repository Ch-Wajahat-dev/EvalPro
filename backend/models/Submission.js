const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [
    {
      project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1
      }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Submission', submissionSchema);
