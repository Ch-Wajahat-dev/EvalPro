const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');
const Project = require('../models/Project');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s/g, '_'))
});
const upload = multer({ storage });

// GET /api/projects/admin-all  (Admin: all projects regardless of status)
router.get('/admin-all', protect, adminOnly, async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/projects  (only approved AND active)
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    let filter = { approvalStatus: 'approved' };
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }
    const projects = await Project.find(filter).sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/projects/proposals  (Admin: all student proposals, or all projects with ?mode=all)
router.get('/proposals', protect, adminOnly, async (req, res) => {
  try {
    const filter = req.query.mode === 'all'
      ? {}
      : { proposedBy: { $exists: true, $ne: null } };
    const proposals = await Project.find(filter)
      .populate('proposedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(proposals);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/projects/my-proposals  (Student: own proposals)
router.get('/my-proposals', protect, async (req, res) => {
  try {
    const proposals = await Project.find({ proposedBy: req.user._id }).sort({ createdAt: -1 });
    res.json(proposals);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/projects/propose  (Student: submit new project proposal)
router.post('/propose', protect, upload.fields([{ name: 'image' }, { name: 'document' }]), async (req, res) => {
  try {
    const { name, description, score, category } = req.body;
    const image = req.files?.image ? '/uploads/' + req.files.image[0].filename : '';
    const document = req.files?.document ? '/uploads/' + req.files.document[0].filename : '';

    const project = await Project.create({
      name,
      description,
      score: score || 0,
      category,
      studentName: req.user.name,
      proposedBy: req.user._id,
      image,
      document,
      approvalStatus: 'pending',
      inStatus: false
    });
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PATCH /api/projects/:id/approval  (Admin: approve or reject)
router.patch('/:id/approval', protect, adminOnly, async (req, res) => {
  try {
    const { action, score, rejectionNote } = req.body; // action: 'approve' | 'reject'
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (action === 'approve') {
      project.approvalStatus = 'approved';
      project.inStatus = true;
      if (score !== undefined) project.score = score;
      project.rejectionNote = '';
    } else if (action === 'reject') {
      project.approvalStatus = 'rejected';
      project.inStatus = false;
      project.rejectionNote = rejectionNote || '';
    } else {
      return res.status(400).json({ message: 'Invalid action. Use approve or reject.' });
    }

    await project.save();
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/projects/:id
router.get('/:id', async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ message: 'Project not found' });
  }
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/projects (Admin)
router.post('/', protect, adminOnly, upload.fields([{ name: 'image' }, { name: 'document' }]), async (req, res) => {
  try {
    const { name, description, score, category, studentName } = req.body;
    const image = req.files?.image ? '/uploads/' + req.files.image[0].filename : '';
    const document = req.files?.document ? '/uploads/' + req.files.document[0].filename : '';

    const project = await Project.create({ name, description, score, category, studentName, image, document });
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/projects/:id (Admin)
router.put('/:id', protect, adminOnly, upload.fields([{ name: 'image' }, { name: 'document' }]), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const { name, description, score, category, studentName, inStatus } = req.body;
    if (name) project.name = name;
    if (description) project.description = description;
    if (score !== undefined) project.score = score;
    if (category) project.category = category;
    if (studentName !== undefined) project.studentName = studentName;
    if (inStatus !== undefined) project.inStatus = inStatus === 'true';
    if (req.files?.image) project.image = '/uploads/' + req.files.image[0].filename;
    if (req.files?.document) project.document = '/uploads/' + req.files.document[0].filename;

    await project.save();
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/projects/:id (Admin)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
