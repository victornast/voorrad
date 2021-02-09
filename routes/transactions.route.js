'use strict';

const express = require('express');
const router = new express.Router();
const routeGuard = require('../middleware/route-guard');

router.get('/', routeGuard, (req, res, next) => {
  res.render('transactions/transaction', { title: 'Add Transaction' });
});

router.get('/:id/edit', routeGuard, (req, res, next) => {
  const id = req.params.id;
  res.render('transactions/edit', { title: 'Edit Transaction' });
});

module.exports = router;
