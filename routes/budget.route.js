'use strict';

const express = require('express');
const router = new express.Router();
const routeGuard = require('../middleware/route-guard');
const Transaction = require('./../models/transactions.model');
const Category = require('./../models/categories.model');
const Budget = require('./../models/budget.model');

router.get('/month', routeGuard, async (req, res, next) => {
  try {
    const id = req.user.budgetId;

    const currentDate = {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1
    };
    const currentMonth = {
      start: new Date(currentDate.year, currentDate.month - 1),
      end: new Date(currentDate.year, currentDate.month)
    };

    const budget = await Budget.findById(id);
    // fix mongodb error: userid as objects instead of strings
    for (let index = 0; index < budget.userId.length; index++) {
      budget.userId[index] = { userId: budget.userId[index] };
    }
    const categories = await Category.find({ budgetId: id }).lean();
    for (let index = 0; index < categories.length; index++) {
      categories[index].actualAmount = 0;
    }

    const transactions = await Transaction.find({
      $and: [
        { $or: budget.userId },
        {
          $and: [
            { date: { $gt: currentMonth.start } },
            { date: { $lte: currentMonth.end } }
          ]
        }
      ]
    })
      .sort({ date: 1 })
      .populate({ path: 'segments', populate: { path: 'categoryId' } });
    const incomes = [],
      expenses = [];
    for (const transaction of transactions) {
      for (const segment of transaction.segments) {
        if (segment.categoryId.label === 'income') {
          incomes.push(transaction);
          categories.find(
            (category) => category.name === segment.categoryId.name
          ).actualAmount += segment.amount;
        } else {
          expenses.push(transaction);
          categories.find(
            (category) => category.name === segment.categoryId.name
          ).actualAmount += segment.amount;
        }
      }
    }

    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec'
    ];
    res.render('transactions/monthly', {
      title: 'Monthly View',
      incomes,
      expenses,
      categories,
      budget,
      viewedMonth:
        String(currentDate.year) + ' / ' + months[currentDate.month - 1]
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
