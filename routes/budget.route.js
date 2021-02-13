'use strict';

const express = require('express');
const router = new express.Router();
const routeGuard = require('../middleware/route-guard');
const Transaction = require('./../models/transactions.model');
const Category = require('./../models/categories.model');
const Budget = require('./../models/budget.model');

router.get('/month', routeGuard, (req, res, next) => {
  const id = req.user.budgetId;
  const currentDate = {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1
  };
  const currentMonth = {
    start: new Date(currentDate.year, currentDate.month - 1),
    end: new Date(currentDate.year, currentDate.month)
  };
  let currency;
  const categories = [];

  const userIds = [];
  Budget.findById(id)
    .then((result) => {
      currency = result.currency;
      for (const user of result.userId) {
        userIds.push({ userId: user });
      }
      return Category.find({ budgetId: id });
    })
    .then((results) => {
      for (const category of results) {
        const copyCat = {};
        copyCat.actualAmount = 0;
        copyCat.plannedAmount = category.plannedAmount;
        copyCat.name = category.name;
        copyCat.label = category.label;
        categories.push(copyCat);
      }

      return Transaction.find({
        $and: [
          { $or: userIds },
          {
            $and: [
              { date: { $gt: currentMonth.start } },
              { date: { $lte: currentMonth.end } }
            ]
          }
        ]
      })
        .sort({ date: 1 })
        .populate('categoryId');
    })

    .then((results) => {
      for (const category of categories) {
        for (const transaction of results) {
          if (category.name === transaction.categoryId[0].name) {
            const func = transaction.amount.reduce((a, b) => {
              return a + b;
            }, 0);
            category.actualAmount += func;
            category.difference =
              category.plannedAmount - category.actualAmount;
          }
        }
      }

      res.render('transactions/monthly', {
        title: 'Monthly View',
        results,
        currency,
        categories
      });
    })

    .catch((error) => {
      next(error);
    });
});

router.get('/year', routeGuard, (req, res) => {
  res.render('transactions/yearly', { title: 'Yearly View' });
});

module.exports = router;
