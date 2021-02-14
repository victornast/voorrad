'use strict';

const express = require('express');
const router = new express.Router();
const routeGuard = require('../middleware/route-guard');
const Segment = require('./../models/segment.model');
const Category = require('./../models/categories.model');

router.get('/', routeGuard, (req, res, next) => {
  Category.find({ budgetId: req.user.budgetId })
    .then((categories) => {
      res.render('categories/categories', {
        title: 'Categories',
        categories
      });
    })
    .catch((error) => {
      next(error);
    });
});

router.get('/add', routeGuard, (req, res) => {
  res.render('categories/add', { title: 'Add Categories' });
});

router.post('/add', routeGuard, (req, res, next) => {
  const data = req.body;
  Category.create({
    label: data.label,
    name: data.name,
    budgetId: req.user.budgetId,
    plannedAmount: data.plannedAmount
  })
    .then(() => {
      res.redirect('/categories');
    })
    .catch((error) => {
      next(error);
    });
});
router.get('/edit/:id', routeGuard, (req, res, next) => {
  const id = req.params.id;
  Category.findById(id)
    .then((category) => {
      res.render('categories/edit', { category, title: 'Edit Category' });
    })
    .catch((error) => {
      next(error);
    });
});

router.post('/edit/:id', routeGuard, (req, res, next) => {
  const data = req.body;
  const id = req.params.id;
  Category.findByIdAndUpdate(
    id,
    {
      name: data.name,
      plannedAmount: data.plannedAmount
    },
    { useFindAndModify: false }
  )
    .then(() => {
      res.redirect('/categories');
    })
    .catch((error) => {
      next(error);
    });
});

router.get('/delete/:id', routeGuard, (req, res, next) => {
  const id = req.params.id;
  let transactionSegments;
  return Category.findById(id)
    .then((category) => {
      return Segment.find({ categoryId: category._id }).then((doc) => {
        transactionSegments = doc;
        return Category.find({ budgetId: req.user.budgetId });
      });
    })
    .then((categories) => {
      res.render('categories/delete', {
        transactionSegments,
        categories,
        title: 'Delete Category'
      });
    })
    .catch((error) => {
      next(error);
    });
});

router.post('/delete/:id', routeGuard, (req, res, next) => {
  const data = req.body;
  const id = req.params.id;
  const newId = data.newCategory;
  Segment.updateMany({ categoryId: id }, { categoryId: newId })
    .then(() => {
      return Category.findByIdAndDelete(id);
    })
    .then(() => {
      res.redirect('/categories');
    })
    .catch((error) => {
      next(error);
    });
});

module.exports = router;
