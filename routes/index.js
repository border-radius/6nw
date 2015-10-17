var express = require('express');
var models = require('../models');

var router = express.Router();
var launched = new Date();

router.get('/', function (req, res, next) {
  models.message.findAll({
    attributes: [
      'type',
      [ models.Sequelize.fn('count', '*'), 'count' ]
    ],
    group: 'type'
  }).then(function (result) {
    var json = {
      uptime: new Date() - launched,
      total: {}
    };

    result.forEach(function (item) {
      json.total[item.dataValues.type] = item.dataValues.count;
    })

    res.json(json);
  }).catch(next);
});

module.exports = router;
