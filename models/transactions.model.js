'use strict';

const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  date: {
    type: Date
  },
  amount: [
    {
      type: Number,
      required: true
    }
  ],
  transactionSource: {
    type: String
  },
  categoryId: [
    {
      type: mongoose.Types.ObjectId,
      ref: 'Category'
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
