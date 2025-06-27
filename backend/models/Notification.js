const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now, 
  },
  status: {
    type: String,
    enum: ['unread', 'read', 'archived'],
    required: true,
    default: 'unread',
  },
});

module.exports = mongoose.model('Notification', notificationSchema);
