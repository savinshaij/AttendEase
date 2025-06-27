const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const User = require('../models/User');
const { verifyToken, allowRoles, requireRole } = require('../middleware/auth');
const Notification = require('../models/Notification');

// ✅ Assign task (Admin/Manager with department check)
router.post('/assign', verifyToken, allowRoles('admin', 'manager'), async (req, res) => {
  try {
    const { employeeId, title, description } = req.body;

    const targetEmployee = await User.findById(employeeId);
    if (!targetEmployee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    if (req.user.role === 'manager' && req.user.department !== targetEmployee.department) {
      return res.status(403).json({ message: 'Cannot assign tasks outside your department' });
    }

    const task = await Task.create({ employee: employeeId, title, description });

    // 🔔 Notify employee
    await Notification.create({
      employee: employeeId,
      title: 'New Task Assigned',
      body: `You have been assigned a new task: "${title}".`,
      date: new Date(),
      status: 'unread',
    });

    res.status(201).json({ message: 'Task assigned', task });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


// ✅ View my tasks (Employee)
router.get('/my-tasks', verifyToken, requireRole('employee'), async (req, res) => {
  try {
    const tasks = await Task.find({ employee: req.user.userId }).sort({ createdAt: -1 });
    res.json({ tasks });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Update task status (Employee)
router.put('/:id/status', verifyToken, requireRole('employee'), async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'in-progress', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, employee: req.user.userId },
      { status },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // 🔔 Notify the assigner (assumed to be admin/manager)
    const adminOrManager = await User.findById(task.assignedBy || null);
    const employee = await User.findById(req.user.userId);

    if (adminOrManager) {
      await Notification.create({
        employee: adminOrManager._id,
        title: `Task "${task.title}" Updated`,
        body: `${employee.name} marked the task as "${status}".`,
        date: new Date(),
        status: 'unread',
      });
    }

    res.json({ message: 'Task status updated', task });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});


// ✅ Admin/Manager: View all assigned tasks
router.get('/all', verifyToken, allowRoles('admin', 'manager'), async (req, res) => {
  try {
    const filter = req.user.role === 'manager'
      ? { department: req.user.department }
      : {};

    const tasks = await Task.find()
      .populate({
        path: 'employee',
        match: filter,
        select: 'name email department'
      })
      .sort({ createdAt: -1 });

    // Filter out tasks where employee didn't match (null)
    const filtered = tasks.filter(t => t.employee !== null);

    res.json({ tasks: filtered });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Get tasks of any employee (Admin/Manager with department check)
router.get('/employee/:employeeId', verifyToken, allowRoles('admin', 'manager'), async (req, res) => {
  try {
    const employee = await User.findById(req.params.employeeId);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    // ✅ Managers can only access employees in their department
    if (req.user.role === 'manager' && req.user.department !== employee.department) {
      return res.status(403).json({ message: 'Access denied: different department' });
    }

    const tasks = await Task.find({ employee: employee._id }).sort({ createdAt: -1 });
    res.json({ tasks });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
