const router = require('express').Router();

const mongoose = require('mongoose');
const models = require('../models');

router.get(
  '/replay/attitude/:satellite/:dateFrom/to/:dateTo/',
  async (req, res, next) => {
    try {
      const { satellite, dateFrom, dateTo } = req.params;

      console.log(req.params);

      let attitude;
      attitude = await models.Attitude.find({
        satellite: satellite,
        // createdAt: {
        //   $gte: dateFrom,
        //   $lt: dateTo,
        // }
      }).sort({ createdAt: -1 }).limit(50);

      res.json(attitude || {})
    } catch (error) {
      next(error);
    }

    return next();
  }
);

module.exports = router;
