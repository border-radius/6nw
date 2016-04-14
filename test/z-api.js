'use strict';

var assert = require('assert');
var request = require('supertest');
var app = require('../app');

describe('API', function () {
  it('should get 10 latest messages', function (done) {
    request(app)
    .get('/messages')
    .query({
      limit: 10
    })
    .expect(200)
    .expect(function (res) {
      var messages = res && res.body;
      assert(messages instanceof Object, 'Messages should be an object');
      assert(messages.rows instanceof Array, 'Messages.rows should be an array');
      assert(messages.where instanceof Object, 'Messages.where should be an object');
      assert.equal(Object.keys(messages.where).length, 0, 'Messages.where should be empty object');
      assert.equal(messages.orderBy, 'updatedAt', 'Messages.orderBy should be "updatedAt"');
      assert.equal(messages.orderDirection, 'desc', 'Messages.orderDirection should be "desc"');
      assert.equal(messages.limit, 10, 'Messages.limit should be 10');
      assert.equal(messages.offset, 0, 'Messages.offset should be 0');
      assert.equal(typeof messages.count, 'number', 'Messages.count should be a number');
      assert.equal(messages.rows.length, 10, 'Length of messages should be equal to limit');

      messages.rows.forEach(function (message) {
        if (message.type === 'post') {
          assert.equal(typeof message.replies, 'number', 'Post should have replies count');
        }
      });
    })
    .end(done);
  });
});