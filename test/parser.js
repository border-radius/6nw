'use strict'

var assert = require('assert');

var parser = require('../lib/parser');
var schemes = require('../schemes');

describe('Parser', function () {
  it('should parse bnw thread', function (done) {
    this.timeout(5000);
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
    this.timeout(5000);
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
    this.timeout(5000);
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

  it('should get date of #5D4A6F', function (done) {
    this.timeout(5000);
    parser.messageDate('5D4A6F', function (e, date) {
      if (e) {
        return done(e);
      }

      assert(date instanceof Date);
      assert(date.getTime() === new Date(1271549666413.15).getTime());

      done();
    });
  });

  it('should get list of newest ids', function (done) {
    this.timeout(5000);
    parser.page(0, function (e, messages) {
      if (e) {
        return done(e);
      }

      assert(messages instanceof Array && messages.length === 20);

      done();
    });
  });

  it('should get list of messages created after #5D4A6F', function (done) {
    this.timeout(30000);
    parser.after('5D4A6F', function (e, ids) {
      if (e) {
        return done(e);
      }

      var expected = [ 'F1ED20','F9F1D8','63A387','3755D7','ECC765','D2AB43','97AE12','DB04D5','D5F77C','6BDB6B','FFB632','DD2079','76DF2D','341DE2','BF6F40','979155','5F1BEA','968C8F','35781F','3CCC50' ];

      assert(ids instanceof Array);
      assert(ids.length >= expected.length, 'IDs length (' + ids.length + ') should be not less than ' + expected.length);

      ids = ids.map(function (id) {
        return id.id;
      });

      expected.forEach(function (id) {
        assert(ids.indexOf(id) > -1, id + ' not found');
      });

      done();
    });
  });

  it('should get list of messages created after #5D4A6F faster with cache', function (done) {
    this.timeout(5000);
    parser.after('5D4A6F', function (e, ids) {
      if (e) {
        return done(e);
      }

      var expected = [ 'F1ED20','F9F1D8','63A387','3755D7','ECC765','D2AB43','97AE12','DB04D5','D5F77C','6BDB6B','FFB632','DD2079','76DF2D','341DE2','BF6F40','979155','5F1BEA','968C8F','35781F','3CCC50' ];

      assert(ids instanceof Array);
      assert(ids.length >= expected.length, 'IDs length (' + ids.length + ') should be not less than ' + expected.length);

      ids = ids.map(function (id) {
        return id.id;
      });

      expected.forEach(function (id) {
        assert(ids.indexOf(id) > -1, id + ' not found');
      });

      done();
    });
  });
});