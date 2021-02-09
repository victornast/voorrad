'use strict';

const express = require('express');
const router = new express.Router();
const routeGuard = require('../middleware/route-guard');

const Category = require('./../models/categories.model');
const Transaction = require('./../models/transactions.model');

router.get('/', routeGuard, (req, res, next) => {
  let today = new Date().toISOString().substr(0, 10);
  console.log(today);
  Category.find()
    .then((categories) => {
      res.render('transactions/transaction', {
        title: 'Add Transaction',
        categories,
        today
      });
    })
    .catch((error) => next(error));
});

router.post('/', routeGuard, (req, res, next) => {
  const data = req.body;
  Transaction.create({
    date: data.date,
    amount: data.amount,
    transactionSource: data.transactionSource,
    categoryId: data.categoryId,
    userId: req.user._id,
    notes: data.notes
  })
    .then((transaction) => {
      console.log(transaction);
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
