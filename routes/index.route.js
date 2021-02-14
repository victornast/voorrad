'use strict';

const express = require('express');
const router = new express.Router();
const routeGuard = require('../middleware/route-guard');

const Budget = require('./../models/budget.model');
const Transaction = require('./../models/transactions.model');

router.get('/', (req, res) => {
  res.render('home', { title: 'Voorrad' });
});

router.get('/overview', routeGuard, async (req, res, next) => {
  try {
    const budget = await Budget.findById(req.user.budgetId).lean();
    for (let index = 0; index < budget.userId.length; index++) {
      budget.userId[index] = { userId: budget.userId[index] };
    }
    budget.currentBalance = budget.openingBalance;
    const currentYear = new Date().getFullYear();
    const viewedYear = {
      prev: new Date(currentYear - 1, 12),
      current: new Date(currentYear, 12)
    };
    const transactions = await Transaction.find({
      $and: [
        { $or: budget.userId },
        {
          $and: [
            { date: { $gt: viewedYear.prev } },
            { date: { $lte: viewedYear.current } }
          ]
        }
      ]
    })
      .sort({ date: 1 })
      .populate({ path: 'segments', populate: { path: 'categoryId' } })
      .lean();
    for (const transaction of transactions) {
      for (const segment of transaction.segments) {
        if (segment.categoryId.label === 'income') {
          budget.currentBalance += segment.amount;
        } else {
          budget.currentBalance -= segment.amount;
        }
      }
    }

    res.render('authentication/overview', { title: 'Overview', budget });
  } catch (error) {
    next(error);
  }
});

router.get('/profile', routeGuard, (req, res) => {
  res.render('authentication/profile', { title: 'Profile Settings' });
});

router.post('/profile', routeGuard, (req, res) => {
  res.redirect('/profile');
});

module.exports = router;
