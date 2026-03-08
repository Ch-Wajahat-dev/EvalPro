const mongoose = require('mongoose');

const evaluationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
        min: 1
      }
    }
  ],
  totalScore: {
    type: Number,
    default: 0
  },
  supervisorComments: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  scoringMethod: {
    type: String,
    enum: ['Standard', 'Rubric-Based', 'Peer Review', 'Supervisor Only'],
    default: 'Standard'
  },
  giftMessage: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Submitted', 'Under Review', 'Evaluated', 'Approved'],
    default: 'Submitted'
  },
  feedback: {
    type: String,
    default: ''
  },
  supervisorScore: {
    type: Number,
    default: null,
    min: 0,
    max: 100
  }
}, { timestamps: true });

module.exports = mongoose.model('Evaluation', evaluationSchema);
