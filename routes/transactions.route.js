'use strict';

const express = require('express');
const router = new express.Router();
const routeGuard = require('../middleware/route-guard');

const Category = require('./../models/categories.model');
const Transaction = require('./../models/transactions.model');

router.get('/income', routeGuard, (req, res, next) => {
  const today = new Date().toISOString().substr(0, 10);
  console.log(today);
  Category.find({
    $and: [{ label: 'income' }, { budgetId: req.user.budgetId }]
  })
    .then((categories) => {
      res.render('transactions/income', {
        title: 'Add Transaction',
        categories,
        today
      });
    })
    .catch((error) => next(error));
});

router.post('/income', routeGuard, (req, res, next) => {
  const data = req.body;
  Transaction.create({
    date: data.date,
    amount: [Math.abs(data.amount)],
    transactionSource: data.transactionSource,
    categoryId: [data.categoryId],
    userId: req.user._id,
    notes: data.notes
  })
    .then(() => {
      res.redirect('/budget/month');
    })
    .catch((error) => next(error));
});

router.get('/expense', routeGuard, (req, res, next) => {
  const today = new Date().toISOString().substr(0, 10);
  console.log(today);
  Category.find({
    $and: [{ label: 'expense' }, { budgetId: req.user.budgetId }]
  })
    .then((categories) => {
      res.render('transactions/expense', {
        title: 'Add Transaction',
        categories,
        today
      });
    })
    .catch((error) => next(error));
});

router.post('/expense', routeGuard, (req, res, next) => {
  const data = req.body;
  Transaction.create({
    date: data.date,
    amount: [-Math.abs(data.amount)],
    transactionSource: data.transactionSource,
    categoryId: [data.categoryId],
    userId: req.user._id,
    notes: data.notes
  })
    .then(() => {
      res.redirect('/budget/month');
    })
    .catch((error) => next(error));
});

router.get('/:id/edit', routeGuard, (req, res, next) => {
  const id = req.params.id;
  res.render('transactions/edit', { title: 'Edit Transaction' });
});

router.post('/:id/edit', routeGuard, (req, res, next) => {
  const id = req.params.id;
  res.redirect('/budget/month');
});

module.exports = router;
