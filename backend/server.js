const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();
const connectDB = require('./config/db');

const app = express();

// ✅ Connect to MongoDB
connectDB();

// ✅ Security Middleware
app.use(helmet());

// ✅ CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : [];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`❌ CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

// ✅ Import Routes
const authRoutes = require('./routes/auth');
const leaveRoutes = require('./routes/leave');
const attendanceRoutes = require('./routes/attendance');
const dutyRoutes = require('./routes/duty');
const feedbackRoutes = require('./routes/feedback');
const taskRoutes = require('./routes/task');
const adminRoutes = require('./routes/admin');
const usersRoutes = require('./routes/users');
const notificationRoutes = require('./routes/notification');

// ✅ Check if any route failed to load
if (
  !authRoutes || !leaveRoutes || !attendanceRoutes ||
  !dutyRoutes || !feedbackRoutes || !taskRoutes || !adminRoutes || !usersRoutes || !notificationRoutes 
) {
  console.error('❌ One or more route modules are not exporting correctly.');
  process.exit(1);
}

// ✅ Register Routes
app.use('/api/auth', authRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/duty', dutyRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/task', taskRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/notifications', notificationRoutes);

// ✅ Root Route
app.get('/', (req, res) => res.send('✅ Attend Ease API Running...'));

// ❌ Catch-all route
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
