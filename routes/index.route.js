'use strict';

const express = require('express');
const router = new express.Router();
const routeGuard = require('../middleware/route-guard');

router.get('/', (req, res, next) => {
  res.render('home', { title: 'Hello World!' });
});

router.get('/overview', routeGuard, (req, res, next) => {
  res.render('authentication/overview', { title: 'Overview' });
});

router.get('/profile', routeGuard, (req, res, next) => {
  res.render('authentication/profile', { title: 'Profile Settings' });
});

module.exports = router;
