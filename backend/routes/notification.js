const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const User = require('../models/User');
const { verifyToken, allowRoles } = require('../middleware/auth');
const mongoose = require('mongoose');

// 🔐 Send notifications to multiple employees (admin/manager only)
router.post('/send', verifyToken, allowRoles('admin', 'manager'), async (req, res) => {
  try {
    const { employeeIds, title, body } = req.body;

    // ✅ Basic input validation
    if (
      !Array.isArray(employeeIds) ||
      employeeIds.length === 0 ||
      typeof title !== 'string' ||
      typeof body !== 'string' ||
      !title.trim() ||
      !body.trim()
    ) {
      return res.status(400).json({ message: 'Missing or invalid fields.' });
    }

    // ✅ Fetch all target users in one DB query
    const targets = await User.find({
      _id: { $in: employeeIds },
    });

    // ✅ Filter valid targets based on role logic
    const notificationsToCreate = targets
      .filter((user) => {
        if (user.role === 'admin' && req.user.role !== 'admin') return false;
        return true;
      })
      .map((user) => ({
        employee: user._id,
        title: title.trim(),
        body: body.trim(),
        date: new Date(),
        status: 'unread',
      }));

    if (notificationsToCreate.length === 0) {
      return res.status(400).json({ message: 'No valid recipients for notification.' });
    }

    // ✅ Create all notifications at once
    const notifications = await Notification.insertMany(notificationsToCreate);

    res.status(201).json({
      message: 'Notifications sent successfully',
      count: notifications.length,
      notifications,
    });
  } catch (err) {
    console.error('❌ Error sending notifications:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 📥 View all notifications for current user
router.get('/my', verifyToken, async (req, res) => {
  try {
    const notifications = await Notification.find({ employee: req.user.userId })
      .sort({ date: -1 });

    res.status(200).json({ notifications });
  } catch (err) {
    console.error('❌ Error fetching user notifications:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ✅ Mark a specific notification as read
router.patch('/:id/read', verifyToken, async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid notification ID' });
  }

  try {
    const updated = await Notification.findOneAndUpdate(
      { _id: id, employee: req.user.userId },
      { status: 'read' },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Notification not found or not owned by you' });
    }

    res.json({ message: 'Notification marked as read', notification: updated });
  } catch (err) {
    console.error('❌ Error updating notification status:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 📊 Full report of all notifications (admin/manager only)
router.get('/report', verifyToken, allowRoles('admin', 'manager'), async (req, res) => {
  try {
    const report = await Notification.find()
      .populate('employee', 'name email role')
      .sort({ date: -1 });

    res.status(200).json({ report });
  } catch (err) {
    console.error('❌ Error generating notification report:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
