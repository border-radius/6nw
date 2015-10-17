'use strict';

var assert = require('assert');
var request = require('request');
var sync = require('../lib/sync');

var id;

describe('Syncronization', function () {
  it('should get 40th post', function (done) {
    request({
      url: 'https://bnw.im/api/show?page=1',
      json: true
    }, function (e, res, body) {
      if (!e && (res.statusCode < 200 || res.statusCode >= 300)) {
        e = new Error('HTTP ' + res.statusCode);
      }

      if (e) {
        return done(e);
      }

      id = body.messages[0].id;

      assert(/^[A-Z0-9]{6}$/.test(id));

      done();
    });
  });

  it('should sync threads starting from 40th post', function (done) {
    this.timeout(10000);
    sync.sync({
      lastID: id
    }, done);
  });
});