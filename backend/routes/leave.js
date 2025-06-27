const express = require('express');
const router = express.Router();
const Leave = require('../models/Leave');
const LeaveType = require('../models/LeaveType');
const LeaveBalance = require('../models/LeaveBalance');
const LeavePolicy = require('../models/LeavePolicy');
const { verifyToken, requireRole ,allowRoles} = require('../middleware/auth');
const User = require('../models/User'); 
const Notification = require('../models/Notification');


// ✅ Apply for Leave (Employee Only)
router.post('/apply', verifyToken, requireRole('employee'), async (req, res) => {
  try {
    const { policy, startDate, endDate, reason } = req.body;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const numDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    if (start > end) {
      return res.status(400).json({ message: 'Start date cannot be after end date' });
    }

    const policyDoc = await LeavePolicy.findById(policy);
    if (!policyDoc) return res.status(400).json({ message: 'Invalid policy selected' });

    const balance = await LeaveBalance.findOne({
      employee: req.user.userId,
      policy
    });

    if (!balance || balance.remainingBalance < numDays) {
      return res.status(400).json({ message: 'Insufficient leave balance' });
    }

    // ✅ Create leave request
    const leave = await Leave.create({
      employee: req.user.userId,
      policy,
      startDate,
      endDate,
      reason
    });

    // 🔔 Send notifications to manager(s) and admin
    const employee = await User.findById(req.user.userId);
    const managersAndAdmins = await User.find({
      $or: [
        { role: 'admin' },
        { role: 'manager', department: employee.department }
      ]
    });

    const notifications = managersAndAdmins.map((user) => ({
      employee: user._id,
      title: 'New Leave Request',
      body: `${employee.name} has requested leave from ${new Date(startDate).toDateString()} to ${new Date(endDate).toDateString()}.`,
      date: new Date(),
      status: 'unread',
    }));

    await Notification.insertMany(notifications);

    res.status(201).json({ message: 'Leave request submitted', leave });
  } catch (error) {
    console.error('❌ Error in leave apply:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Get All Leave Requests (Manager Only)
router.get('/all', verifyToken,allowRoles('admin', 'manager'), async (req, res) => {
  try {
    console.log('Decoded Token:', req.user);
    const manager = req.user;
    if (!manager) return res.status(404).json({ message: 'Manager not found' });

    const leaves = await Leave.find()
      .populate({
        path: 'employee',
        match: { department: manager.department }, // ✅ department filter
        select: 'name email role department'
      })
      .populate({
        path: 'policy',
        populate: { path: 'leaveType', select: 'typeName' }
      })
      .sort({ createdAt: -1 });

    // Filter out leaves where populate().match() didn’t match (null employees)
    const filteredLeaves = leaves.filter(l => l.employee !== null);

    res.json(filteredLeaves);
  } catch (error) {
    console.error('❌ Error fetching leave list:', error.message);
    res.status(500).json({ message: 'Failed to fetch leave requests' });
  }
});


// ✅ Approve or Reject Leave (Manager Only)
router.put('/:id/status', verifyToken, allowRoles('admin', 'manager'), async (req, res) => {
  try {
    const { status } = req.body;
    const leaveId = req.params.id;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const leave = await Leave.findById(leaveId)
      .populate('employee')
      .populate('policy');

    if (!leave) return res.status(404).json({ message: 'Leave not found' });
    if (leave.status !== 'pending') return res.status(400).json({ message: 'Leave is already processed' });

    // ✅ Validate department match
    const manager = await User.findById(req.user.userId);
    if (leave.employee.department !== manager.department) {
      return res.status(403).json({ message: 'Unauthorized to modify leave outside your department' });
    }

    if (status === 'approved') {
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      const numDays = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;

      const balance = await LeaveBalance.findOne({
        employee: leave.employee._id,
        policy: leave.policy._id
      });

      if (!balance || balance.remainingBalance < numDays) {
        return res.status(400).json({ message: 'Cannot approve — insufficient leave balance' });
      }

      balance.remainingBalance -= numDays;
      await balance.save();
    }

    leave.status = status;
    await leave.save();

    // 🔔 Send notification to the employee
    await Notification.create({
      employee: leave.employee._id,
      title: `Leave ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      body: `Your leave request from ${new Date(leave.startDate).toDateString()} to ${new Date(leave.endDate).toDateString()} has been ${status}.`,
      date: new Date(),
      status: 'unread'
    });

    res.json({ message: `Leave ${status}`, leave });
  } catch (err) {
    console.error('❌ Error updating leave status:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});



// ✅ Get current user's leave balances
router.get('/balance/me', verifyToken, allowRoles('admin', 'manager','employee'), async (req, res) => {
  try {
    const balances = await LeaveBalance.find({ employee: req.user.userId })
      .populate({
        path: 'policy',
        populate: { path: 'leaveType', select: 'typeName' }
      })
      .select('-__v');

    if (!balances || balances.length === 0) {
      return res.status(404).json({ message: 'No leave balances found' });
    }

    res.json({ balances });
  } catch (err) {
    console.error('❌ Error fetching balances:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Get my leave requests
router.get('/my', verifyToken, requireRole('employee'), async (req, res) => {
  try {
    const requests = await Leave.find({ employee: req.user.userId })
      .populate({
        path: 'policy',
        populate: { path: 'leaveType', select: 'typeName' }
      })
      .sort({ createdAt: -1 });

    res.json({ requests });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/leave-type', verifyToken, async (req, res) => {
  try {
    const leaveTypes = await LeaveType.find().sort({ typeName: 1 });
    res.json(leaveTypes);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
