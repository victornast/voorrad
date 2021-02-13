'use strict';

const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  categoryId: {
    type: mongoose.Types.ObjectId,
    ref: 'Category'
  },
  amount: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('Segment', schema);
