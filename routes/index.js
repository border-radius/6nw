var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;
var express = require('express');
var models = require('../models');
var messages = require('./messages');

var router = express.Router();
var launched = new Date();

try {
  var version = fs.readFileSync(path.join(__dirname, '../.git/logs/HEAD'), {
    encoding: 'utf8'
  });
  
  if (!version) {
    throw new Error('git logs are empty');
  }

  version = version.trim().split('\n').slice(-1)[0];

  if (!version) {
    throw new Error('failed to parse git logs');
  }

  version = version.split(' ')[1];

  if (!version) {
    throw new Error('failed to parse git log line');
  }
} catch (e) {
  console.error(e);
}

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
      total: {},
      version: version
    };

    result.forEach(function (item) {
      json.total[item.dataValues.type] = item.dataValues.count;
    })

    res.json(json);
  }).catch(next);
});

router.get('/messages', messages.get);

module.exports = router;
