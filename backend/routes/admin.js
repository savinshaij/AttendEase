const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const User = require('../models/User');
const Leave = require('../models/Leave');
const Feedback = require('../models/Feedback');
const Attendance = require('../models/Attendance');
const LeavePolicy = require('../models/LeavePolicy');
const LeaveBalance = require('../models/LeaveBalance');
const LeaveType = require('../models/LeaveType');
const Task = require('../models/Task');
router.get('/summary', verifyToken, requireRole('admin'), async (req, res) => {
    try {
        // Retrieve counts using Promise.all for concurrent requests
        const [totalEmployees, totalManagers, totalLeaves, pendingLeaves] = await Promise.all([
            User.countDocuments({ role: 'employee' }),
            User.countDocuments({ role: 'manager' }),
            Leave.countDocuments(),
            Leave.countDocuments({ status: 'pending' }),
        ]);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get today's check-ins and total users of role employee/manager
        const [checkInsToday, totalUsers] = await Promise.all([
            Attendance.countDocuments({ date: today, checkIn: { $exists: true } }),
            User.countDocuments({ role: { $in: ['employee', 'manager'] } })
        ]);

        const absentees = totalUsers - checkInsToday;

        // Respond with collected stats in a structured format
        res.json({
            stats: {
                employees: totalEmployees,
                managers: totalManagers,
                leaveRequests: totalLeaves,
                pendingLeaves,
                checkedInToday: checkInsToday,
                absenteesToday: absentees,
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// DELETE /admin/leave-policy/:id
router.delete('/leave-policy/:id', verifyToken, requireRole('admin'), async (req, res) => {
  await LeavePolicy.findByIdAndDelete(req.params.id);
  res.json({ message: 'Policy deleted successfully' });
});


// ✅ Create a leave policy
router.post('/leave-policy', verifyToken, requireRole('admin'), async (req, res) => {
    try {
        const { leaveType, policyName, description, numberOfLeaves } = req.body;

        const existing = await LeavePolicy.findOne({ leaveType });
        if (existing) return res.status(400).json({ message: 'Policy for this leave type already exists' });

        const policy = await LeavePolicy.create({ leaveType, policyName, description, numberOfLeaves });
        res.status(201).json({ message: 'Leave policy created', policy });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// ✅ Get all leave policies
router.get('/leave-policies', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const policies = await LeavePolicy.find().populate('leaveType', 'typeName');
    res.json({ policies });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});



router.post('/init-leave-balance', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { employeeId } = req.body;

    // 👉 Fetch leave policies with populated leaveType for typeName access
    const policies = await LeavePolicy.find().populate('leaveType');

    if (!policies.length) {
      return res.status(400).json({ message: 'No leave policies found' });
    }

    const results = [];

    for (const policy of policies) {
      // Check for existing balance
      const existing = await LeaveBalance.findOne({
        employee: employeeId,
        policy: policy._id
      });

      if (existing) {
        results.push({
          policy: policy._id,
          leaveType: policy.leaveType?.typeName || 'Unknown',
          status: 'already exists',
          id: existing._id
        });
        continue;
      }

      // Create new balance
      const balance = await LeaveBalance.create({
        employee: employeeId,
        policy: policy._id,
        totalBalance: policy.numberOfLeaves,
        remainingBalance: policy.numberOfLeaves
      });

      results.push({
        policy: policy._id,
        leaveType: policy.leaveType?.typeName || 'Unknown',
        status: 'created',
        id: balance._id
      });
    }

    res.status(201).json({ message: 'Leave balances initialized', results });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


router.get('/leave-types', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const types = await LeaveType.find();
    res.json({ leaveTypes: types });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Optional: Create a leave type
router.post('/leave-type', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { typeName } = req.body;
    const existing = await LeaveType.findOne({ typeName });
    if (existing) return res.status(400).json({ message: 'Leave type already exists' });

    const newType = await LeaveType.create({ typeName });
    res.status(201).json({ message: 'Leave type created', leaveType: newType });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


// GET /api/admin/dashboard
router.get('/overview', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalEmployees,
      totalManagers,
      totalLeaves,
      pendingLeaves,
      unreadFeedback,
      checkInsToday,
      totalUsers
    ] = await Promise.all([
      User.countDocuments({ role: 'employee' }),
      User.countDocuments({ role: 'manager' }),
      Leave.countDocuments(),
      Leave.countDocuments({ status: 'pending' }),
      Feedback.countDocuments(), // Add unread filter if needed
      Attendance.countDocuments({ date: today, checkIn: { $exists: true } }),
      User.countDocuments({ role: { $in: ['employee', 'manager'] } }),
    ]);

    const absenteesToday = totalUsers - checkInsToday;

    const [recentLeaves, recentFeedbacks] = await Promise.all([
      Leave.find().sort({ createdAt: -1 }).limit(3).populate('employee', 'name'),
      Feedback.find().sort({ createdAt: -1 }).limit(2).populate('employee', 'name'),
    ]);

    const activities = [
      ...recentLeaves.map((l) => ({
        user: l.employee.name,
        action: 'submitted leave request',
        time: l.createdAt,
        status: l.status,
      })),
      ...recentFeedbacks.map((f) => ({
        user: f.employee.name,
        action: 'submitted feedback',
        time: f.createdAt,
        status: 'new',
      })),
    ].sort((a, b) => b.time - a.time);

    res.json({
      stats: {
        employees: totalEmployees,
        managers: totalManagers,
        leaveRequests: totalLeaves,
        pendingLeaves,
        unreadFeedback,
        checkedInToday: checkInsToday,
        absenteesToday,
      },
      activities,
    });

  } catch (err) {
    console.error('[Admin Overview Error]', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});



router.get('/users', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { role, isActive, search } = req.query;
    const query = {};

    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [{ name: regex }, { email: regex }, { phone: regex }];
    }

    const users = await User.find(query).sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users', error: err.message });
  }
});

// ✅ Get single user details with related data
router.get('/users/:id', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const [leaves, tasks, attendance, feedbacks] = await Promise.all([
      Leave.find({ employee: id }),
      Task.find({ employee: id }),
      Attendance.find({ employee: id }),
      Feedback.find({ employee: id })
    ]);

    res.json({ user, leaves, tasks, attendance, feedbacks });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user details', error: err.message });
  }
});

// ✅ Update user
router.put('/users/:id', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const allowedFields = [
      'name', 'email', 'phone', 'role', 'department', 'age',
      'qualification', 'experience', 'address', 'isActive'
    ]

    const updates = {}
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field]
      }
    })

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updates, { new: true })

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json({ message: 'User updated successfully', user: updatedUser })
  } catch (err) {
    console.error('User update error:', err)
    res.status(500).json({ message: 'Update failed', error: err.message })
  }
})


// ✅ Delete user
router.delete('/users/:id', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed', error: err.message });
  }
});
module.exports = router;
