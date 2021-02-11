'use strict';

const express = require('express');
const router = new express.Router();
const routeGuard = require('../middleware/route-guard');
const Transaction = require('./../models/transactions.model');
// const Category = require('./../models/categories.model');
const Budget = require('./../models/budget.model');

router.get('/month', routeGuard, (req, res, next) => {
  const id = req.user.budgetId;
  return Budget.findById(id)
    .then((result) => {
      console.log(result);
      const userIds = [];
      for (const user of result.userId) {
        userIds.push({ userId: user });
      }
      Transaction.find({ $or: userIds })
        .populate('categoryId')
        .then((results) => {
          console.log(results);
          res.render('transactions/monthly', {
            title: 'Monthly View',
            results
          });
        });
    })
    .catch((error) => {
      next(error);
    });
});

router.get('/year', routeGuard, (req, res, next) => {
  res.render('transactions/yearly', { title: 'Yearly View' });
});

module.exports = router;
