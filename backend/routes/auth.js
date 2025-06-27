const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { verifyToken, requireRole, allowRoles } = require('../middleware/auth');

require('dotenv').config();

const router = express.Router();


// ✅ Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is deactivated. Please contact admin.' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Include all user details in the token payload
    const tokenPayload = {
      userId: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      department: user.department,
    };

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    res.json({ message: 'Login successful', token, user });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
});


// ✅ Admin Registering Users
router.post('/admin/register', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      role,
      department,
      age,
      qualification,
      experience,
      address,
      isActive
    } = req.body;

    // ✅ Basic validation
    if (!name || !email || !phone || !password || !role) {
      return res.status(400).json({ message: 'Name, email, phone, password, and role are required' });
    }

    // ✅ Restrict role
    if (!['manager', 'employee'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role for admin registration' });
    }

    // ✅ Check uniqueness
    const exists = await User.findOne({ $or: [{ email }, { phone }] });
    if (exists) return res.status(400).json({ message: 'Email or phone already in use' });

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create user
    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role,
      department: department || '',
      age: age ? Number(age) : undefined,
      qualification: qualification || '',
      experience: experience || '',
      address: address || '',
      isActive: isActive !== undefined ? isActive : true
    });

    res.status(201).json({ message: 'User registered by admin', user });

  } catch (err) {
    console.error('[ADMIN REGISTER ERROR]', err);
    res.status(500).json({ message: 'Admin registration failed', error: err.message });
  }
});




// ✅ Get current user's profile
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user profile' });
  }
});


router.get('/employees', verifyToken, allowRoles('employee', 'admin'), async (req, res) => {
  const users = await User.find({
    role: 'employee',
    _id: { $ne: req.user.userId } // still exclude self
  }).select('name email');

  res.json({ users });
});


module.exports = router;
