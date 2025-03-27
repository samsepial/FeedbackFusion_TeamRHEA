const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  department: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high']
  },
  threshold: {
    type: Number,
    required: true,
    min: 1
  },
  active: {
    type: Boolean,
    default: true
  },
  triggered: {
    type: Boolean,
    default: false
  },
  triggeredAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model('Alert', alertSchema);