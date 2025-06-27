const mongoose = require('mongoose');

const dutyHandoverSchema = new mongoose.Schema({
 
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true // Who submitted the handover request
  },
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  fromEmployee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  toEmployee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fromDate: {
    type: Date,
    required: true
  },
  toDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('DutyHandover', dutyHandoverSchema);
