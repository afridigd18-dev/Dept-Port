const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  registerNumber: {
    type: String,
    required: [true, 'Register Number is required'],
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Name is required']
  },
  classCode: {
    type: String,
    required: [true, 'Class Code is required']
  },
  email: {
    type: String,
    required: [true, 'Email is required']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // To link to login account
  }
});

module.exports = mongoose.model('Student', StudentSchema);
