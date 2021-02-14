'use strict';

const { Router } = require('express');

const bcryptjs = require('bcryptjs');
const User = require('./../models/user.model');
const Budget = require('./../models/budget.model');
const Default = require('./../models/default.model');
const Category = require('./../models/categories.model');

const router = new Router();

router.get('/sign-up', (req, res) => {
  res.render('authentication/sign-up');
});

router.post('/sign-up', (req, res, next) => {
  const { name, email, password, openingBalance, currency } = req.body;
  bcryptjs
    .hash(password, 10)
    .then((hash) => {
      return User.create({
        name,
        email,
        passwordHashAndSalt: hash
      });
    })
    .then((user) => {
      req.session.userId = user._id;
      return Budget.create({
        userId: [user._id],
        name: 'Personal Budget',
        openingBalance,
        currency,
        active: true
      });
    })
    .then((budget) => {
      req.session.budgetId = budget._id;
      return Default.find().lean();
    })
    .then((defaultCategories) => {
      for (const category of defaultCategories) {
        delete category._id;
        category.budgetId = req.session.budgetId;
      }
      return Category.create(defaultCategories);
    })
    .then(() => {
      res.redirect('/overview');
    })
    .catch((error) => {
      next(error);
    });
});

router.get('/sign-in', (req, res) => {
  res.render('authentication/sign-in');
});

router.post('/sign-in', (req, res, next) => {
  let user;
  const { email, password } = req.body;
  User.findOne({ email })
    .then((document) => {
      if (!document) {
        return Promise.reject(new Error("There's no user with that email."));
      } else {
        user = document;
        return bcryptjs.compare(password, user.passwordHashAndSalt);
      }
    })
    .then((result) => {
      if (result) {
        req.session.userId = user._id;
        return Budget.find({ $and: [{ active: true }, { userId: user._id }] });
      } else {
        return Promise.reject(new Error('Wrong password.'));
      }
    })
    .then((budget) => {
      req.session.budgetId = budget[0]._id;
      res.redirect('/overview');
    })
    .catch((error) => {
      next(error);
    });
});

router.post('/sign-out', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
