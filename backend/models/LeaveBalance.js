const mongoose = require('mongoose');

const leaveBalanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  policy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LeavePolicy',
    required: true
  },
  totalBalance: {
    type: Number,
    required: true
  },
  remainingBalance: {
    type: Number,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('LeaveBalance', leaveBalanceSchema);
