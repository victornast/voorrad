'use strict';

const express = require('express');
const router = new express.Router();
const routeGuard = require('../middleware/route-guard');

router.get('/', routeGuard, (req, res, next) => {
  res.render('transactions/transaction', { title: 'Add Transaction' });
});

router.post('/', routeGuard, (req, res, next) => {
  res.redirect('/budget/month');
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
