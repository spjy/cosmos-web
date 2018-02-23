const router = require('express').Router();

const mongoose = require('mongoose');
const models = require('../models');

router.get(
  '/replay/from/:dateFrom/to/:dateTo',
  async (req, res, next) => {
    try {
      const { dateFrom, dateTo } = req.params;

      let orbit;
      orbit = await models.Orbit.find();

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
