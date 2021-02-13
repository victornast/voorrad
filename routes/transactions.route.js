'use strict';

const express = require('express');
const router = new express.Router();
const routeGuard = require('../middleware/route-guard');

const Category = require('./../models/categories.model');
const Transaction = require('./../models/transactions.model');
const Segment = require('../models/segment.model');

router.get('/income', routeGuard, (req, res, next) => {
  const today = new Date().toISOString().substr(0, 10);
  Category.find({
    $and: [{ label: 'income' }, { budgetId: req.user.budgetId }]
  })
    .then((categories) => {
      res.render('transactions/income', {
        title: 'Add Income',
        categories,
        today
      });
    })
    .catch((error) => next(error));
});

router.post('/income', routeGuard, (req, res, next) => {
  const data = req.body;
  Segment.create({
    categoryId: data.categoryId,
    amount: Math.abs(data.amount)
  })
    .then((segment) => {
      return Transaction.create({
        date: data.date,
        transactionSource: data.transactionSource,
        segments: [segment._id],
        userId: req.user._id,
        notes: data.notes
      });
    })
    .then(() => {
      res.redirect('/budget/month');
    })
    .catch((error) => next(error));
});

router.get('/expense', routeGuard, (req, res, next) => {
  const today = new Date().toISOString().substr(0, 10);
  Category.find({
    $and: [{ label: 'expense' }, { budgetId: req.user.budgetId }]
  })
    .then((categories) => {
      res.render('transactions/expense', {
        title: 'Add Expense',
        categories,
        today
      });
    })
    .catch((error) => next(error));
});

router.post('/expense', routeGuard, (req, res, next) => {
  const data = req.body;
  Segment.create({
    categoryId: data.categoryId,
    amount: Math.abs(data.amount)
  })
    .then((segment) => {
      return Transaction.create({
        date: data.date,
        transactionSource: data.transactionSource,
        segments: [segment._id],
        userId: req.user._id,
        notes: data.notes
      });
    })
    .then(() => {
      res.redirect('/budget/month');
    })
    .catch((error) => next(error));
});

module.exports = router;
