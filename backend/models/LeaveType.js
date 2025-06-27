const mongoose = require('mongoose');

const leaveTypeSchema = new mongoose.Schema({
  typeName: {
    type: String,
    required: true,
    unique: true // e.g., "Sick Leave", "Casual Leave"
  }
}, { timestamps: true });

module.exports = mongoose.model('LeaveType', leaveTypeSchema);
