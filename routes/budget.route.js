'use strict';

const express = require('express');
const router = new express.Router();
const routeGuard = require('../middleware/route-guard');
const Transaction = require('./../models/transactions.model');

router.get('/month', routeGuard, (req, res, next) => {
  // const data = req.body;
  Transaction.find()
    .populate()
    .then((results) => {
      res.render('transactions/monthly', {
        title: 'Monthly View',
        results
      });
    })
    .catch((error) => {
      next(error);
    });
});

router.get('/year', routeGuard, (req, res, next) => {
  res.render('transactions/yearly', { title: 'Yearly View' });
});

router.get('/categories', routeGuard, (req, res, next) => {
  res.render('transactions/categories', { title: 'Categories' });
});

router.post('/categories', routeGuard, (req, res, next) => {
  res.redirect('/budget/categories');
});

module.exports = router;
