'use strict';

const express = require('express');
const router = new express.Router();
const routeGuard = require('../middleware/route-guard');
const Transaction = require('./../models/transactions.model');
const Category = require('./../models/categories.model');
const Budget = require('./../models/budget.model');

router.get('/month', routeGuard, async (req, res, next) => {
  try {
    const id = req.user.budgetId;

    const currentDate = {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1
    };
    const viewedDate = {
      year: Number(req.query.year) || currentDate.year,
      month: Number(req.query.month) || currentDate.month
    };

    const viewedMonth = {
      start: new Date(viewedDate.year, viewedDate.month - 1),
      end: new Date(viewedDate.year, viewedDate.month),
      startYear: new Date(viewedDate.year - 1, 12),
      endYear: new Date(viewedDate.year, 12)
    };

    const budget = await Budget.findById(id).lean();
    // fixes mongodb error: userid as objects instead of strings
    for (let index = 0; index < budget.userId.length; index++) {
      budget.userId[index] = { userId: budget.userId[index] };
    }

    budget.plannedIncome = budget.plannedExpense = 0;

    const categories = await Category.find({ budgetId: id }).lean();

    for (let index = 0; index < categories.length; index++) {
      if (categories[index].label === 'income') {
        budget.plannedIncome += categories[index].plannedAmount;
      } else {
        budget.plannedExpense += categories[index].plannedAmount;
      }
      categories[index].actualAmount = 0;
    }

    const firstEntry = await Transaction.find({ $or: budget.userId })
      .sort({ date: 1 })
      .limit(1)
      .lean();
    const firstEntryDate = {
      year: firstEntry[0].date.getFullYear(),
      month: firstEntry[0].date.getMonth() + 1
    };
    const prevDate = { possible: true };
    const nextDate = { possible: true };
    prevDate.month = viewedDate.month - 1;
    prevDate.year = viewedDate.year;
    nextDate.month = viewedDate.month + 1;
    nextDate.year = viewedDate.year;
    if (prevDate.month === 0) {
      prevDate.month = 12;
      prevDate.year--;
    }
    if (
      new Date(prevDate.year, prevDate.month) <
      new Date(firstEntryDate.year, firstEntryDate.month)
    ) {
      prevDate.possible = false;
    }
    if (nextDate.month === 13) {
      nextDate.month = 1;
      nextDate.year++;
    }
    if (
      new Date(nextDate.year, nextDate.month) >
      new Date(currentDate.year, currentDate.month)
    ) {
      nextDate.possible = false;
    }

    const transactions = await Transaction.find({
      $and: [
        { $or: budget.userId },
        {
          $and: [
            { date: { $gt: viewedMonth.startYear } },
            { date: { $lte: viewedMonth.endYear } }
          ]
        }
      ]
    })
      .sort({ date: 1 })
      .populate({ path: 'segments', populate: { path: 'categoryId' } })
      .lean();

    const incomes = [];
    const expenses = [];
    budget.currentBalance = budget.openingBalance;
    budget.monthIncome = budget.monthExpense = budget.monthStartBalance = 0;

    for (const transaction of transactions) {
      if (
        (transaction.date > viewedMonth.start) &
        (transaction.date < viewedMonth.end)
      ) {
        for (const [index, segment] of transaction.segments.entries()) {
          if (segment.categoryId.label === 'income') {
            if (index === 0) {
              incomes.push(transaction);
            }
            categories.find(
              (category) => category.name === segment.categoryId.name
            ).actualAmount += segment.amount;
            budget.monthIncome += segment.amount;
          } else {
            if (index === 0) {
              expenses.push(transaction);
            }
            categories.find(
              (category) => category.name === segment.categoryId.name
            ).actualAmount += segment.amount;
            budget.monthExpense += segment.amount;
          }
        }
      } else if (transaction.date < viewedMonth.start) {
        for (const segment of transaction.segments) {
          if (segment.categoryId.label === 'income') {
            budget.monthStartBalance += segment.amount;
          } else {
            budget.monthStartBalance -= segment.amount;
          }
        }
      }
    }

    budget.currentBalance +=
      budget.monthStartBalance + budget.monthIncome - budget.monthExpense;

    res.render('transactions/monthly', {
      title: 'Monthly View',
      incomes,
      expenses,
      categories,
      budget,
      viewedMonth: String(viewedDate.year) + ' / ' + String(viewedDate.month),
      nextDate,
      prevDate
    });
  } catch (error) {
    next(error);
  }
});

router.get('/year', routeGuard, async (req, res, next) => {
  try {
    const budget = await Budget.findById(req.user.budgetId).lean();
    for (let index = 0; index < budget.userId.length; index++) {
      budget.userId[index] = { userId: budget.userId[index] };
    }
    budget.currentBalance = budget.openingBalance;
    budget.monthlyIncome = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      value: 0
    }));
    budget.monthlyExpense = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      value: 0
    }));
    budget.monthlyStartBalance = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      value: budget.openingBalance
    }));
    budget.monthlySavings = Array.from({ length: 12 }, (_, i) => ({
      month: `2020 / ${i + 1}`,
      value: 0
    }));
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const viewedYear = {
      prev: new Date(currentYear - 1, 12),
      current: new Date(currentYear, 12)
    };

    const transactions = await Transaction.find({
      $and: [
        { $or: budget.userId },
        {
          $and: [
            { date: { $gt: viewedYear.prev } },
            { date: { $lte: viewedYear.current } }
          ]
        }
      ]
    })
      .sort({ date: 1 })
      .populate({ path: 'segments', populate: { path: 'categoryId' } })
      .lean();

    const categories = await Category.find({
      budgetId: req.user.budgetId
    }).lean();

    for (const category of categories) {
      category.actualAmount = Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        value: 0
      }));
    }

    for (const transaction of transactions) {
      const transactionMonth = transaction.date.getMonth();
      for (const segment of transaction.segments) {
        const segmentCategory = segment.categoryId.name;
        categories.find(
          (category) => category.name === segmentCategory
        ).actualAmount[transactionMonth].value += segment.amount;
        if (segment.categoryId.label === 'income') {
          budget.monthlyIncome[transactionMonth].value += segment.amount;
          budget.currentBalance += segment.amount;
        } else {
          budget.monthlyExpense[transactionMonth].value += segment.amount;
          budget.currentBalance -= segment.amount;
        }
      }
    }

    if (currentMonth < 12) {
      let plannedIncome = 0;
      let plannedExpense = 0;
      for (const category of categories) {
        if (category.label === 'income') {
          plannedIncome += category.plannedAmount;
        } else {
          plannedExpense += category.plannedAmount;
        }
      }
      for (
        let remainingMonths = currentMonth;
        remainingMonths < 12;
        remainingMonths++
      ) {
        for (const category of categories) {
          category.actualAmount[remainingMonths].value = category.plannedAmount;
        }
        budget.monthlyExpense[remainingMonths].value += plannedExpense;
        budget.monthlyIncome[remainingMonths].value += plannedIncome;
      }
    }

    for (let month = 0; month < 12; month++) {
      budget.monthlySavings[month].value =
        budget.monthlyIncome[month].value - budget.monthlyExpense[month].value;
      budget.monthlyStartBalance[month].value +=
        budget.monthlyIncome[month].value;
      budget.monthlyStartBalance[month].value -=
        budget.monthlyExpense[month].value;
      if (month < 11) {
        budget.monthlyStartBalance[month + 1].value =
          budget.monthlyStartBalance[month].value;
      }
    }

    const totalYearlyExpense = budget.monthlyExpense.reduce((acc, val) => {
      return { value: acc.value + val.value };
    });
    const expenseSummary = { names: [], yearlyValues: [] };
    for (const category of categories) {
      if (category.label === 'expense') {
        const categoryYearlyExpense = category.actualAmount.reduce(
          (prev, current) => {
            return { value: prev.value + current.value, month: 0 };
          }
        );
        if (categoryYearlyExpense.value > 0.03 * totalYearlyExpense.value) {
          expenseSummary.names.push(category.name);
          expenseSummary.yearlyValues.push(categoryYearlyExpense.value);
        }
      }
    }

    res.render('transactions/yearly', {
      title: 'Yearly View',
      budget,
      categories,
      expenseSummary
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
