const router = require('express').Router();

const mongoose = require('mongoose');
const models = require('../models');

router.get(
  '/replay/orbit/:satellite/:dateFrom/to/:dateTo/',
  async (req, res, next) => {
    try {
      const { satellite, dateFrom, dateTo } = req.params;

      console.log(req.params);

      let orbit;
      orbit = await models.Orbit.find({
        satellite: satellite,
        // createdAt: {
        //   $gte: dateFrom,
        //   $lt: dateTo,
        // }
      }).sort({ createdAt: -1 }).limit(500);

      res.json(orbit || {})
    } catch (error) {
      next(error);
    }

    return next();
  }
);

module.exports = router;
