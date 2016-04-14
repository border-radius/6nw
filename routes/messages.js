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
      limit: parseInt(req.query.limit),
      transaction: transaction
    }).then(function (result) {
      var posts = result.rows.filter(function (message) {
        return message.type === 'post';
      }).map(function (message) {
        return message.id;
      });
      
      return models.message.findAll({
        where: {
          thread: {
            $in: posts
          }
        },
        attributes: [
          'thread',
          [ models.Sequelize.fn('count', '*'), 'replies' ]
        ],
        group: 'thread'
      }).then(function (count) {
        result.rows = result.rows.map(function (message) {
          count.forEach(function (thread) {
            if (thread.thread === message.id) {
              message.dataValues.replies = parseInt(thread.dataValues.replies) || 0;
            }
          });

          return message;
        });

        return result;
      });
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