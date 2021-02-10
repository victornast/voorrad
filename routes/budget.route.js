'use strict';

const express = require('express');
const router = new express.Router();
const routeGuard = require('../middleware/route-guard');
const Transaction = require('./../models/transactions.model');
const Category = require('./../models/categories.model');

router.get('/month', routeGuard, (req, res, next) => {
  // const data = req.body;
  Transaction.find()
    .populate('categoryId')
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
  // let income = false;
  Category.find()
    .then((categories) => {
      // if (label === 'income') {
      //   income = true;
      // }
      res.render('transactions/categories', {
        title: 'Categories',
        categories
      });
    })
    .catch((error) => {
      next(error);
    });
});

router.get('/add-category', routeGuard, (req, res, next) => {
  res.render('transactions/add-category');
});
// THIS DOES NOT WORK AS EXPECTED - DOES NOT STORE NEW CATEGORY IN DB
router.post('/add-category', routeGuard, (req, res, next) => {
  const data = req.body;
  Category.create({
    label: data.label,
    name: data.name
  })
    .then(() => {
      res.redirect('/budget/categories');
    })
    .catch((error) => {
      next(error);
    });
});

router.post('/categories', routeGuard, (req, res, next) => {
  res.redirect('/budget/categories');
});

module.exports = router;
