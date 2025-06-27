const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { verifyToken, requireRole, allowRoles } = require('../middleware/auth');

// ✅ Employee: Check-In
router.post('/checkin', verifyToken, requireRole('employee'), async (req, res) => {
  try {
    const date = new Date().setHours(0, 0, 0, 0);
    const existing = await Attendance.findOne({ employee: req.user.userId, date });
    if (existing && existing.checkIn) {
      return res.status(400).json({ message: 'Already checked in today' });
    }

    const record = await Attendance.findOneAndUpdate(
      { employee: req.user.userId, date },
      { $set: { checkIn: new Date() } },
      { upsert: true, new: true }
    );

    res.json({ message: 'Checked in', record });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ✅ Employee: Check-Out
router.post('/checkout', verifyToken, requireRole('employee'), async (req, res) => {
  try {
    const date = new Date().setHours(0, 0, 0, 0);
    const record = await Attendance.findOne({ employee: req.user.userId, date });

    if (!record || !record.checkIn) {
      return res.status(400).json({ message: 'You must check in before checking out' });
    }

    if (record.checkOut) {
      return res.status(400).json({ message: 'Already checked out today' });
    }

    record.checkOut = new Date();
    await record.save();

    res.json({ message: 'Checked out', record });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ✅ Employee: View Own Attendance
router.get('/me', verifyToken, requireRole('employee'), async (req, res) => {
  try {
    const records = await Attendance.find({ employee: req.user.userId }).sort({ date: -1 });
    res.json({ records });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Manager: View Team Attendance (restricted by department)
router.get('/team', verifyToken, requireRole('manager'), async (req, res) => {
  try {
    const usersInDept = await User.find({ department: req.user.department }).select('_id');
    const userIds = usersInDept.map((u) => u._id);

    const records = await Attendance.find({ employee: { $in: userIds } })
      .populate('employee', 'name email')
      .sort({ date: -1 });

    res.json({ records });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Admin/Manager: Add or Edit Attendance (with manager department restriction)
router.post('/admin/set', verifyToken, allowRoles('admin', 'manager'), async (req, res) => {
  try {
    const { employeeId, date, checkIn, checkOut } = req.body;

    if (!employeeId || !date) {
      return res.status(400).json({ message: 'employeeId and date are required' });
    }

    // Manager restriction: must be same department
    if (req.user.role === 'manager') {
      const target = await User.findById(employeeId);
      if (!target || target.department !== req.user.department) {
        return res.status(403).json({ message: 'You can only edit attendance for your department' });
      }
    }

    const attendanceDate = new Date(date).setHours(0, 0, 0, 0);
    const updateData = {};

    updateData.checkIn = checkIn ? new Date(`${date}T${checkIn}`) : null;
    updateData.checkOut = checkOut ? new Date(`${date}T${checkOut}`) : null;

    const record = await Attendance.findOneAndUpdate(
      { employee: employeeId, date: attendanceDate },
      { $set: updateData },
      { upsert: true, new: true }
    );

    res.json({ message: 'Attendance updated successfully', record });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ✅ Admin/Manager: View Attendance History for an Employee (with manager restriction)
router.get('/history/:employeeId', verifyToken, allowRoles('admin', 'manager'), async (req, res) => {
  try {
    const employeeId = req.params.employeeId;

    if (req.user.role === 'manager') {
      const employee = await User.findById(employeeId);
      if (!employee || employee.department !== req.user.department) {
        return res.status(403).json({ message: 'Access denied: different department' });
      }
    }

    const records = await Attendance.find({ employee: employeeId }).sort({ date: -1 });
    res.json({ records });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
