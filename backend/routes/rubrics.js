const express = require('express');
const router = express.Router();
const multer = require('multer');
const Rubric = require('../models/Rubric');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s/g, '_'))
});
const upload = multer({ storage });

// GET /api/rubrics - Public: view active rubrics
router.get('/', async (req, res) => {
  try {
    const rubrics = await Rubric.find({ isActive: true, endTime: { $gt: new Date() } }).sort({ endTime: 1 });
    res.json(rubrics);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/rubrics/all - Admin: all rubrics
router.get('/all', protect, adminOnly, async (req, res) => {
  try {
    const rubrics = await Rubric.find().sort({ createdAt: -1 });
    res.json(rubrics);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/rubrics - Admin: create rubric (JSON or multipart)
router.post('/', protect, adminOnly, (req, res, next) => {
  const ct = req.headers['content-type'] || '';
  if (ct.includes('multipart')) return upload.single('image')(req, res, next);
  next();
}, async (req, res) => {
  try {
    const { title, description, discountPercentage, endTime, criteria } = req.body;
    const image = req.file ? '/uploads/' + req.file.filename : '';
    const parsedCriteria = criteria ? (typeof criteria === 'string' ? JSON.parse(criteria) : criteria) : [];

    const rubric = await Rubric.create({ title, description, discountPercentage, endTime, image, criteria: parsedCriteria });
    res.status(201).json(rubric);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PATCH /api/rubrics/:id/toggle - Admin: toggle active status
router.patch('/:id/toggle', protect, adminOnly, async (req, res) => {
  try {
    const rubric = await Rubric.findById(req.params.id);
    if (!rubric) return res.status(404).json({ message: 'Rubric not found' });
    rubric.isActive = !rubric.isActive;
    await rubric.save();
    res.json(rubric);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/rubrics/:id - Admin: delete rubric
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Rubric.findByIdAndDelete(req.params.id);
    res.json({ message: 'Rubric deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
