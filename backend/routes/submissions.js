const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');
const { protect } = require('../middleware/authMiddleware');

// GET /api/submissions - View submission
router.get('/', protect, async (req, res) => {
  try {
    const submission = await Submission.findOne({ user: req.user._id })
      .populate('items.project', 'name category score image description');
    if (!submission) return res.json({ items: [] });
    res.json(submission);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/submissions/add - Add item to submission
router.post('/add', protect, async (req, res) => {
  try {
    const { projectId, quantity = 1 } = req.body;

    let submission = await Submission.findOne({ user: req.user._id });
    if (!submission) {
      submission = new Submission({ user: req.user._id, items: [] });
    }

    const existing = submission.items.find(item => item.project.toString() === projectId);
    if (existing) {
      existing.quantity += Number(quantity);
    } else {
      submission.items.push({ project: projectId, quantity: Number(quantity) });
    }

    await submission.save();
    await submission.populate('items.project', 'name category score image description');
    res.json(submission);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/submissions/:projectId - Update quantity
router.put('/:projectId', protect, async (req, res) => {
  try {
    const { quantity } = req.body;
    const submission = await Submission.findOne({ user: req.user._id });
    if (!submission) return res.status(404).json({ message: 'Submission not found' });

    const item = submission.items.find(i => i.project.toString() === req.params.projectId);
    if (!item) return res.status(404).json({ message: 'Item not in submission' });

    item.quantity = Number(quantity);
    await submission.save();
    await submission.populate('items.project', 'name category score image description');
    res.json(submission);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/submissions/:projectId - Remove item
router.delete('/:projectId', protect, async (req, res) => {
  try {
    const submission = await Submission.findOne({ user: req.user._id });
    if (!submission) return res.status(404).json({ message: 'Submission not found' });

    submission.items = submission.items.filter(i => i.project.toString() !== req.params.projectId);
    await submission.save();
    await submission.populate('items.project', 'name category score image description');
    res.json(submission);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
