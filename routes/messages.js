'use strict';

var models = require('../models');

exports.get = function (req, res, next) {
  var where = typeof req.query.where === 'object' ? req.query.where : {};
  var orderBy = req.query.orderBy || 'updatedAt';
  var orderDirection = req.query.orderDirection || 'desc';
  var limit = parseInt(req.query.limit, 10) || 100;
  var offset = parseInt(req.query.offset, 10) || 0;

  limit = limit > 100 ? 100 : limit;

  models.sequelize.transaction(function (transaction) {
    return models.message.findAndCountAll({
      where: req.query.where || {},
      sort: [[req.query.orderBy || 'updatedAt', req.query.orderDirection || 'desc']],
      limit: parseInt(req.query.limit) 
    });
  }).then(function (result) {
    result.where = where;
    result.orderBy = orderBy;
    result.orderDirection = orderDirection;
    result.limit = limit;
    result.offset = offset;

    res.json(result);
  }).catch(next);
};