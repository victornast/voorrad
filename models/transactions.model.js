'use strict';

const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  date: {
    type: Date
  },
  transactionSource: {
    type: String
  },
  segments: [
    {
      type: mongoose.Types.ObjectId,
      ref: 'Segment'
    }
  ],
  userId: {
    type: mongoose.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String
  }
});

module.exports = mongoose.model('Transaction', schema);
