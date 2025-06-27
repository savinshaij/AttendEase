const mongoose = require('mongoose');

const leavePolicySchema = new mongoose.Schema({
  leaveType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LeaveType',
    required: true
  },
  policyName: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  numberOfLeaves: {
    type: Number,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('LeavePolicy', leavePolicySchema);
