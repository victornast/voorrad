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
    const viewedMonth = {
      start: new Date(currentDate.year, currentDate.month - 1),
      end: new Date(currentDate.year, currentDate.month),
      startYear: new Date(currentDate.year - 1, 12),
      endYear: new Date(currentDate.year, 12)
    };

    const budget = await Budget.findById(id).lean();
    // fix mongodb error: userid as objects instead of strings
    for (let index = 0; index < budget.userId.length; index++) {
      budget.userId[index] = { userId: budget.userId[index] };
    }

    budget.plannedIncome = budget.plannedExpense = 0;

    const categories = await Category.find({ budgetId: id }).lean();

    for (let index = 0; index < categories.length; index++) {
      if (categories[index].label === 'income') {
        budget.plannedIncome += categories[index].plannedAmount;
      } else {
        budget.plannedExpense += categories[index].plannedAmount;
      }
      categories[index].actualAmount = 0;
    }

    const transactions = await Transaction.find({
      $and: [
        { $or: budget.userId },
        {
          $and: [
            { date: { $gt: viewedMonth.startYear } },
            { date: { $lte: viewedMonth.endYear } }
          ]
        }
      ]
    })
      .sort({ date: 1 })
      .populate({ path: 'segments', populate: { path: 'categoryId' } })
      .lean();

    const incomes = [];
    const expenses = [];
    budget.currentBalance = budget.openingBalance;
    budget.monthIncome = budget.monthExpense = budget.monthStartBalance = 0;

    for (const transaction of transactions) {
      if (
        (transaction.date > viewedMonth.start) &
        (transaction.date < viewedMonth.end)
      ) {
        for (const [index, segment] of transaction.segments.entries()) {
          if (segment.categoryId.label === 'income') {
            if (index === 0) {
              incomes.push(transaction);
            }
            categories.find(
              (category) => category.name === segment.categoryId.name
            ).actualAmount += segment.amount;
            budget.monthIncome += segment.amount;
          } else {
            if (index === 0) {
              expenses.push(transaction);
            }
            categories.find(
              (category) => category.name === segment.categoryId.name
            ).actualAmount += segment.amount;
            budget.monthExpense += segment.amount;
          }
        }
      } else if (transaction.date < viewedMonth.start) {
        for (const segment of transaction.segments) {
          if (segment.categoryId.label === 'income') {
            budget.monthStartBalance += segment.amount;
          } else {
            budget.monthStartBalance -= segment.amount;
          }
        }
      }
    }
    budget.currentBalance +=
      budget.monthStartBalance + budget.monthIncome - budget.monthExpense;

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
