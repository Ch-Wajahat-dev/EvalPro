const express = require('express');
const router = express.Router();

// POST /api/newsletter/subscribe
router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ message: 'Valid email required' });
    }
    // In a real system, save to DB or send to email service
    res.json({ message: 'Successfully subscribed to newsletter' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
