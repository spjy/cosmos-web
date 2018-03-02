const router = require('express').Router();

const mongoose = require('mongoose');
const models = require('../models');

router.get(
  '/replay/:dateFrom/to/:dateTo/',
  async (req, res, next) => {
    try {
      const { dateFrom, dateTo } = req.params;

      console.log(req.params);

      let orbit;
      orbit = await models.Orbit.find({
        createdAt: {
          $gte: ISODate(dateFrom),
          $lt: ISODate(dateTo)
        }
      }).limit(500);

      res.json(orbit || {})
    } catch (error) {
      next(error);
    }

    return next();
  }
);

router.get(
  '/replay/from/:date/to/:movements',
  async (req, res, next) => {
    try {
      // function
    } catch (error) {
      next(error);
    }

    return next();
  }
);

module.exports = router;
