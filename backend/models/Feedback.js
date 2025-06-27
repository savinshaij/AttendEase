const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  writing: {
    type: String,
    default: '', // ← Make it optional
  }
}, { timestamps: true });

module.exports = mongoose.model('Feedback', FeedbackSchema);
