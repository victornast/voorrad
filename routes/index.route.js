'use strict';

const express = require('express');
const router = new express.Router();
const routeGuard = require('../middleware/route-guard');

const Budget = require('./../models/budget.model');

router.get('/', (req, res) => {
  res.render('home', { title: 'Voorrad' });
});

router.get('/overview', routeGuard, (req, res, next) => {
  Budget.findById(req.user.budgetId)
    .then((budget) => {
      res.render('authentication/overview', { title: 'Overview', budget });
    })
    .catch((error) => next(error));
});

router.get('/profile', routeGuard, (req, res) => {
  res.render('authentication/profile', { title: 'Profile Settings' });
});

router.post('/profile', routeGuard, (req, res) => {
  res.redirect('/profile');
});

module.exports = router;
