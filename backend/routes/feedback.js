const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const { verifyToken, requireRole } = require('../middleware/auth');

// ✅ Submit feedback (Employee only)
router.post('/submit', verifyToken, requireRole('employee'), async (req, res) => {
  try {
    const { message, writing = '' } = req.body; // ← Default writing to empty string

    const feedback = await Feedback.create({
      employee: req.user.userId,
      message,
      writing
    });

    res.status(201).json({ message: 'Feedback submitted', feedback });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ✅ View all feedbacks (Admin only)
router.get('/all', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate('employee', 'name email')
      .sort({ createdAt: -1 });

    res.json({ feedbacks });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
