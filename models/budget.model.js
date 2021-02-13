'use strict';

const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  userId: [
    {
      type: mongoose.Types.ObjectId,
      ref: 'User'
    }
  ],
  name: {
    type: String
  },
  openingBalance: {
    type: Number,
    default: 0,
    required: true
  },
  currency: {
    type: String,
    required: true,
    enum: ['€', '$']
  },
  active: {
    type: Boolean,
    required: true
  }
});

module.exports = mongoose.model('Budget', schema);
