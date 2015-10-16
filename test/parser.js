'use strict'

var assert = require('assert');

var parser = require('../lib/parser');
var schemes = require('../schemes');

describe('Parser', function () {
  it('should parse bnw thread', function (done) {
    parser.thread('E9SHEL', function (e, messages) {
      if (e) {
        return done(e);
      }

      assert(messages instanceof Array);
      assert(messages.length >= 6);

      schemes.messages(messages, done);
    });
  });

  it('should parse socket recommendations event', function (done) {
    parser.socket({"num": 1, "type": "upd_recommendations_count", "id": "44SCCQ", "recommendations": ["mugiseyebrows"]}, function (e, messages) {
      if (e) {
        return done(e);
      }

      assert(messages instanceof Array);
      assert(messages.length === 1);

      schemes.messages(messages, done);
    })
  });

  it('should parse thread on socket reply event', function (done) {
    parser.socket({"num": 3, "type": "upd_comments_count", "id": "MLUS46"}, function (e, messages) {
      if (e) {
        return done(e);
      }

      assert(messages instanceof Array);
      assert(messages.length >= 3);

      schemes.messages(messages, done);
    });
  });

  it('should parse new message socket event', function (done) {
    parser.socket({
      replycount: 0,
      tags: [],
      text: 'http://i.imgur.com/dw0N0Lh.jpg *бнв_ппл',
      format: null,
      anoncomments: false,
      clubs: [],
      html: '<div class=\'outerborder hentry message\' id=\'4MQJBR\'>\n<div class=\'msg\'>\n<img class=\'avatar avatar_ps\' alt=\'avatar\' src=\'/u/anonymous/avatar/thumb\' />\n<div class="tags">  </div>\n\n\n<div class="imgpreviews">\n<a class="imglink" href="http://i.imgur.com/dw0N0Lh.jpg">\n<img class="imgpreview imgpreview_ps" src="https://i.imgur.com/dw0N0Lhs.png"/>\n</a>\n</div>\n<div class=\'pw entry-title entry-content hasthumbs\'><div class="pwls"><a href="http://i.imgur.com/dw0N0Lh.jpg">http://i.imgur.com/dw0N0Lh.jpg</a> *бнв_ппл</div></div>\n\n\n<div class=\'sign\'><a href="/p/4MQJBR" rel="bookmark" class="msgid">#4MQJBR</a>\n<span class=\'msgb\' id=\'msgb-4MQJBR\'></span>\n(0)\n/ <a href="/u/anonymous" class="usrid">@anonymous</a> / <abbr class="published" title="2015-10-16T17:24:00+0000">0 секунд назад</abbr>\n</div>\n</div>\n</div>\n',
      user: 'anonymous',
      anonymous: true,
      recommendations: [],
      date: 1445016240.752095,
      type: 'new_message',
      id: '4MQJBR'
    }, function (e, messages) {
      if (e) {
        return done(e);
      }

      assert(messages instanceof Array);
      assert(messages.length >= 1);

      schemes.messages(messages, done);
    });
  });
});