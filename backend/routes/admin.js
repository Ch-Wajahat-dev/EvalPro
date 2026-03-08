const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// GET /api/admin/projects — all projects regardless of status
router.get('/projects', protect, adminOnly, async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
