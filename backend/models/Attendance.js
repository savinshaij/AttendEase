const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
date: {
  type: Date,
  required: true,
  default: () => new Date(new Date().setHours(0, 0, 0, 0))
},

  checkIn: {
    type: Date
  },
  checkOut: {
    type: Date
  }
}, { timestamps: true });

attendanceSchema.index({ employee: 1, date: 1 }, { unique: true }); // one record per employee per day

module.exports = mongoose.model('Attendance', attendanceSchema);
