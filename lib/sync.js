'use strict';

var async = require('async');

var models = require('../models');
var parser = require('./parser');

function whenModelsReady (next) {
  function check () {
    if (!models.$ready) {
      return setTimeout(check, 300);
    }

    next();
  }

  check();
}

function sync (opts, next) {
  opts = opts || {};
  opts.concurrency = opts.concurrency || 3;

  var queue = async.queue(function (id, next) {
    parser.thread(id, function (e, messages) {
      if (e) {
        console.error(e);
        return next(e);
      }

      models.message.bulkCreate(messages).then(next.bind(null, null)).catch(next);
    });
  }, opts.concurrency);

  queue.drain = function () {
    parser.after(opts.lastID, function (e, ids) {
      if (e) {
        return next(e);
      }

      if (!ids || !ids.length) {
        console.log('Syncronization finished');
        return next();
      }

      ids = ids.map(function (id) {
        return id.id;
      });

      opts.lastID = ids.slice(-1)[0];

      ids.forEach(function (id) {
        queue.push(id);
      });

      console.log('Pushed ', ids.length, ' threads to the queue. Latest ID is ', opts.lastID);
    });
  };

  if (opts.lastID) {
    queue.push(opts.lastID);
  } else {
    models.message.find({
      order: ['createdAt', 'DESC'],
      limit: 1
    }).then(function (message) {
      queue.push(message && message.id || '5D4A6F');
    }).catch(next);
  }
}

module.exports = {
  whenModelsReady: whenModelsReady,
  sync: function (opts, next) {
    whenModelsReady(function () {
      sync(opts, next);
    });
  }
};