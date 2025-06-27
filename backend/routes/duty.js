// routes/duty.js
const express = require('express');
const router = express.Router();
const DutyHandover = require('../models/DutyHandover');
const { verifyToken, requireRole, allowRoles } = require('../middleware/auth');
const User = require('../models/User'); 
const Notification = require('../models/Notification');

// POST /api/duty/request

router.post('/request', verifyToken, requireRole('employee'), async (req, res) => {
  try {
    const { task, toEmployee, fromDate, toDate } = req.body;

    const existing = await DutyHandover.findOne({
      task,
      fromEmployee: req.user.userId,
      toEmployee,
      fromDate,
      toDate,
      status: 'pending',
    });

    if (existing) {
      return res.status(400).json({ message: 'Similar pending request already exists' });
    }

    const newRequest = await DutyHandover.create({
      task,
      employee: req.user.userId,
      fromEmployee: req.user.userId,
      toEmployee,
      fromDate,
      toDate,
      status: 'pending',
    });

    // 🔔 Notify toEmployee
    const fromUser = await User.findById(req.user.userId);
    await Notification.create({
      employee: toEmployee,
      title: 'New Duty Handover Request',
      body: `${fromUser.name} has requested a duty handover from ${fromDate} to ${toDate}.`,
      date: new Date(),
      status: 'unread',
    });

    res.status(201).json({ message: 'Duty request submitted', request: newRequest });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


// POST /api/duty/assign


router.post('/assign', verifyToken, allowRoles('admin', 'manager'), async (req, res) => {
  try {
    const { task, fromEmployee, toEmployee, fromDate, toDate } = req.body;

    // If manager, ensure both employees are from same department
    if (req.user.role === 'manager') {
      const [fromEmp, toEmp] = await Promise.all([
        User.findById(fromEmployee).select('department name'),
        User.findById(toEmployee).select('department name'),
      ]);

      if (!fromEmp || !toEmp) {
        return res.status(404).json({ message: 'Employee not found' });
      }

      if (
        fromEmp.department !== req.user.department ||
        toEmp.department !== req.user.department
      ) {
        return res.status(403).json({
          message: 'Managers can only assign duties within their department',
        });
      }
    }

    const assigned = await DutyHandover.create({
      task,
      employee: req.user.userId,
      fromEmployee,
      toEmployee,
      fromDate,
      toDate,
      status: 'approved',
    });

    // 🔔 Notify both employees
    const [fromUser, toUser] = await Promise.all([
      User.findById(fromEmployee),
      User.findById(toEmployee),
    ]);

    const notifications = [
      {
        employee: fromEmployee,
        title: 'Duty Assigned',
        body: `You have been assigned a duty to ${toUser.name} from ${fromDate} to ${toDate}.`,
        date: new Date(),
        status: 'unread',
      },
      {
        employee: toEmployee,
        title: 'New Duty Assigned',
        body: `You have been assigned a duty by ${fromUser.name} from ${fromDate} to ${toDate}.`,
        date: new Date(),
        status: 'unread',
      },
    ];

    await Notification.insertMany(notifications);

    res.status(201).json({ message: 'Duty assigned and auto-approved', request: assigned });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});



// PUT /api/duty/:id/respond
// 👉 Assigned user accepts or rejects a duty request
router.put('/:id/respond', verifyToken, requireRole('employee'), async (req, res) => {
  const { status } = req.body;
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const request = await DutyHandover.findById(req.params.id)
      .populate('fromEmployee', 'name');

    if (!request) return res.status(404).json({ message: 'Request not found' });

    if (request.toEmployee.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to respond' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Already responded' });
    }

    request.status = status;
    await request.save();

    // 🔔 Notify original sender
    await Notification.create({
      employee: request.fromEmployee._id,
      title: `Duty Request ${status}`,
      body: `Your duty request has been ${status} by ${req.user.name}.`,
      date: new Date(),
      status: 'unread',
    });

    res.json({ message: `Request ${status}`, request });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


// PUT /api/duty/:id/status
// 👉 Manager/Admin approves/rejects employee-submitted requests


router.put('/:id/status', verifyToken, allowRoles('admin', 'manager'), async (req, res) => {
  const { status } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const request = await DutyHandover.findById(req.params.id)
      .populate('fromEmployee', 'department name')
      .populate('toEmployee', 'department name')
      .populate('employee', 'name');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (req.user.role === 'manager') {
      const managerDept = req.user.department;
      const fromDept = request.fromEmployee?.department;
      const toDept = request.toEmployee?.department;

      if (fromDept !== managerDept && toDept !== managerDept) {
        return res.status(403).json({
          message: 'Managers can only approve/reject requests within their department',
        });
      }
    }

    request.status = status;
    await request.save();

    // 🔔 Notify original requester
    await Notification.create({
      employee: request.employee._id,
      title: `Duty Request ${status}`,
      body: `Your duty handover request has been ${status} by ${req.user.name}.`,
      date: new Date(),
      status: 'unread',
    });

    res.json({ message: `Request ${status}`, request });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});



// GET /api/duty/my-requests
// 👉 Employee sees all requests submitted by them
router.get('/my-requests', verifyToken, requireRole('employee'), async (req, res) => {
  try {
    const requests = await DutyHandover.find({ employee: req.user.userId })
      .populate('task', 'title')
      .populate('toEmployee', 'name')
      .sort({ createdAt: -1 });

    res.json({ requests });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/duty/assigned-to-me
// 👉 Employee sees duties assigned to them
router.get('/assigned-to-me', verifyToken, requireRole('employee'), async (req, res) => {
  try {
    const requests = await DutyHandover.find({ toEmployee: req.user.userId })
      .populate('task', 'title')
      .populate('fromEmployee', 'name')
      .sort({ createdAt: -1 });

    res.json({ requests });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/duty/all
// 👉 Admin/Manager sees all requests
router.get('/all', verifyToken, allowRoles('admin', 'manager'), async (req, res) => {
  try {
    let requests = await DutyHandover.find()
      .populate('employee', 'name department')
      .populate('task', 'title')
      .populate('fromEmployee', 'name department')
      .populate('toEmployee', 'name department')
      .sort({ createdAt: -1 });

    if (req.user.role === 'manager') {
      const dept = req.user.department;

      requests = requests.filter(
        (r) =>
          r.fromEmployee?.department === dept || r.toEmployee?.department === dept
      );
    }

    res.json({ requests });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


module.exports = router;
