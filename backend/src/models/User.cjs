const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String }, // hashed password goes here
  role: {
    type: String,
    enum: ['admin', 'manager', 'supervisor'],
    default: 'supervisor'
  }
});

module.exports = mongoose.model('User', userSchema);
