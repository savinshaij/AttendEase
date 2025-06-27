const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { verifyToken, allowRoles } = require('../middleware/auth');


router.get('/employees', verifyToken, allowRoles('admin', 'manager', 'employee'), async (req, res) => {
  try {
    const { search } = req.query;

    // Base query: get only employees and exclude current user
    let query = {
      role: 'employee',
      _id: { $ne: req.user.userId },
    };

    // ✅ Restrict managers to only employees from their department
    if (req.user.role === 'manager') {
      query.department = req.user.department;
    }

    // Optional search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query).select('_id name email role department');

    res.status(200).json({ users });
  } catch (err) {
    console.error('❌ Error fetching employees:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
