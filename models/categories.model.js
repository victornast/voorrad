'use strict';

const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  label: {
    type: String,
    enum: ['income', 'expense'],
    required: true
  },
  name: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Types.ObjectId,
    ref: 'User'
  },
  plannedAmount: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('Category', schema);
