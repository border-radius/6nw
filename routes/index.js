var fs = require('fs');
var spawn = require('child_process').spawn;
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

try {
  var secret = JSON.parse(fs.readFileSync('/etc/secret.json', {
    encoding: 'utf8'
  }));
} catch (e) {
  console.error(e);
}

router.post('/hook/:secret', function (req, res, next) {
  if (!secret || !secret.secret || req.params.secret !== secret.secret) {
    var e = new Error('Forbidden');
    e.status = 403;
    return next(e);
  }

  spawn('npm', ['run', 'restart']);
});

module.exports = router;
