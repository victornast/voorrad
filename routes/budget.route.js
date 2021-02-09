'use strict';

const express = require('express');
const router = new express.Router();
const routeGuard = require('../middleware/route-guard');

router.get('/month', routeGuard, (req, res, next) => {
  res.render('transactions/monthly', { title: 'Monthly View' });
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
