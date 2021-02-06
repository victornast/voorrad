'use strict';

const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  label: {
    type: Boolean
  },
  category: {
    type: String
  },
  userId: {
    type: mongoose.Types.ObjectId,
    ref: 'User'
  }
});

module.exports = mongoose.model('Category', schema);
