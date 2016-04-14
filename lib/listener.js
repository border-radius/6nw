'use strict';

var models = require('../models');
var parser = require('./parser');
var ws = require('./ws');

module.exports = function (e) {
  if (e) {
    return console.error(e);
  }

  ws('wss://bnw.im/ws?v=2', function (message) {
    models.sequelize.transaction(function (transaction) {
      return models.message.create(message);
    }).catch(function (e) {
      console.error('--- WEBSOCKET HANDLER ERROR:');
      console.error(e);
      console.error(message);
      console.error('---');
    });
  });
};