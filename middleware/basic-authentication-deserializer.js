'use strict';

const User = require('./../models/user.model');

module.exports = (req, res, next) => {
  const userId = req.session.userId;
  const budgetId = req.session.budgetId;
  if (userId && budgetId) {
    User.findById(userId)
      .then((user) => {
        req.user = user;
        if (user) req.user.budgetId = budgetId;
        next();
      })
      .catch((error) => {
        next(error);
      });
  } else {
    next();
  }
};
