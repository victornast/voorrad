'use strict';

const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: 'User'
  },
  name: {
    type: Number
  }
});

module.exports = mongoose.model('Budget', schema);
