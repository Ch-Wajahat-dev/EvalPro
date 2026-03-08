const express = require('express');
const router = express.Router();
const Evaluation = require('../models/Evaluation');
const Submission = require('../models/Submission');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// POST /api/evaluations - Place a new evaluation (Supervisor/Admin only)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { supervisorComments, phone, scoringMethod, giftMessage } = req.body;

    const submission = await Submission.findOne({ user: req.user._id }).populate('items.project');
    if (!submission || submission.items.length === 0) {
      return res.status(400).json({ message: 'Submission is empty' });
    }

    const totalScore = submission.items.reduce((sum, item) => {
      return sum + (item.project?.score || 0) * item.quantity;
    }, 0);

    const evaluation = await Evaluation.create({
      user: req.user._id,
      items: submission.items.map(item => ({ project: item.project._id, quantity: item.quantity })),
      totalScore,
      supervisorComments,
      phone,
      scoringMethod: scoringMethod || 'Standard',
      giftMessage
    });

    // Clear submission after evaluation
    submission.items = [];
    await submission.save();

    res.status(201).json(evaluation);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/evaluations/my - Personal evaluation history
router.get('/my', protect, async (req, res) => {
  try {
    const evaluations = await Evaluation.find({ user: req.user._id })
      .populate('items.project', 'name category score image')
      .sort({ createdAt: -1 });
    res.json(evaluations);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/evaluations - All evaluations (Admin)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const evaluations = await Evaluation.find()
      .populate('user', 'name email')
      .populate('items.project', 'name category score')
      .sort({ createdAt: -1 });
    res.json(evaluations);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PATCH /api/evaluations/:id/status - Update evaluation status, score & feedback (Admin)
router.patch('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status, feedback, supervisorScore } = req.body;
    const validStatuses = ['Submitted', 'Under Review', 'Evaluated', 'Approved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const updateData = { status };
    if (feedback !== undefined) updateData.feedback = feedback;
    if (supervisorScore !== undefined && supervisorScore !== '') {
      updateData.supervisorScore = Number(supervisorScore);
    }

    const evaluation = await Evaluation.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('user', 'name email');

    if (!evaluation) return res.status(404).json({ message: 'Evaluation not found' });
    res.json(evaluation);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
