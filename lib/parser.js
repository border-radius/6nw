var request = require('request');

var API = 'https://bnw.im/api/';
var pageIndex = {};

function HTTPError (e, res) {
  if (e) {
    return e;
  }

  if (res.statusCode < 200 || res.statusCode >= 300) {
    return new Error('HTTP ' + res.statusCode + ': ' + res.request.uri.href);
  }
}

function socket (message, next) {
  switch (message.type) {
    case 'upd_recommendations_count':
      var messages = message.recommendations.map(function (recommendation) {
        return {
          id: message.id + '/@' + recommendation,
          type: 'recommendation',
          thread: message.id,
          user: recommendation,
          createdAt: new Date(),
          updatedAt: new Date()
        };
      });

      return next(null, messages);

    case 'new_message':
    case 'upd_comments_count':
      return thread(message.id, next);
    default:
      return next(new Error('Unknown socket event type'));
  };
}

function thread (messageId, next) {
  messageId = /^[A-Z0-9]{6}\/[\@A-z0-9\-]{3,}$/.test(messageId) ? messageId.slice(0, 6) : messageId;

  console.log('Requesting thread #' + messageId);

  if (!/^[A-Z0-9]{6}$/.test(messageId)) {
    return next(new Error('Invalid message id: ' + messageId));
  }

  var messages = [];

  request({
    url: API + 'show?replies=1&message=' + messageId,
    json: true
  }, function (e, res, body) {
    e = HTTPError(e, res);

    if (e) {
      return next(e);
    }

    messages.push({
      id: body.message.id,
      type: 'post',
      thread: body.message.id,
      user: body.message.user,
      text: body.message.text,
      createdAt: new Date(body.message.date * 1000),
      updatedAt: new Date((body.replies.slice(-1)[0] || body.message).date * 1000)
    });

    body.message.recommendations.forEach(function (recommendation) {
      messages.push({
        id: body.message.id + '/@' + recommendation,
        type: 'recommendation',
        thread: body.message.id,
        user: recommendation,
        createdAt: new Date(body.message.date * 1000),
        updatedAt: new Date(body.message.date * 1000)
      });
    });

    body.replies.forEach(function (reply) {
      if (reply.replyto) {
        reply.text = reply.text.replace(/^@[^ ]+/, '');
      }

      var parsedReply = {
        id: reply.id,
        type: 'reply',
        thread: body.message.id,
        user: reply.user,
        text: reply.text,
        createdAt: new Date(reply.date * 1000),
        updatedAt: new Date(reply.date * 1000)
      };

      if (reply.replyto) {
        parsedReply.parent = reply.replyto;
      }

      messages.push(parsedReply);
    });

    return next(null, messages);
  });
}

function after (opts, next) {
  opts = opts instanceof Object ? opts : {
    id: opts
  };

  opts.step = opts.step || 2500;

  if (!/^[A-Z0-9]{6}$/.test(opts.id)) {
    return next(new Error('Invalid message id: ' + opts.id));
  }

  // get message's date if not defined
  if (!(opts.date instanceof Date)) {
    return messageDate(opts.id, function (e, date) {
      if (e) {
        return next(e);
      }

      opts.date = date;

      after(opts, next);
    });
  }

  // get nearest page from index
  if (!opts.page || opts.page < 0) {
    opts.page = 0;

    for (var pageN in pageIndex) {
      if (pageIndex[pageN] >= opts.date) {
        opts.page = parseInt(pageN, 10);
        opts.step = Math.ceil(2500 / Object.keys(pageIndex).length);
      }
    }
  }

  page(opts.page, function (e, messages) {
    if (e) {
      return next(e);
    }

    // too far, step down
    if (!messages.length || messages.slice(-1)[0].date < opts.date) {
      opts.step = Math.ceil(opts.step / 2);
      opts.max = opts.page;
      opts.page -= opts.step;
      return after(opts, next);
    }

    // not yet, go on
    if (messages[0].date > opts.date) {
      while (opts.max && (opts.step > 1) && (opts.page + opts.step >= opts.max)) {
        opts.step = Math.ceil(opts.step / 2);
      }

      opts.page += opts.step;
      return after(opts, next);
    }

    var index = -1;

    messages.forEach(function (message, i) {
      if (message.id === opts.id) {
        index = i;
      }
    });

    if (index === -1) {
      return next(new Error('Message not found'));
    }

    messages = messages.slice(index + 1);

    if (opts.page === 0) {
      return next(null, messages);
    }

    page(opts.page - 1, function (e, extraMessages) {
      if (e) {
        return next(e);
      }

      next(null, messages.concat(extraMessages));
    });
  });
}

function page (pageN, next) {
  console.log('Requesting page #', pageN);

  request({
    url: API + 'show?page=' + pageN,
    json: true
  }, function (e, res, body) {
    e = HTTPError(e, res);

    if (e) {
      return next(e);
    }

    var oldest = body && body.messages && body.messages[0] && body.messages[0].date;

    if (oldest) {
      pageIndex[pageN] = new Date(oldest * 1000);
    }

    var messages = (body && body.messages || []).map(function (message) {
      return {
        id: message.id,
        date: new Date(message.date * 1000)
      };
    });

    next(null, messages);
  });
}

function messageDate (id, next) {
  console.log('Requesting date of #', id);

  request({
    url: API + 'show?message=' + id,
    json: true
  }, function (e, res, body) {
    e = HTTPError(e, res);

    if (e) {
      return next(e);
    }

    var date = body && body.messages && body.messages[0] && body.messages[0].date;

    if (!date) {
      return next(new Error('Can not find message date'));
    }

    next(null, new Date(date * 1000));
  });
}

module.exports = {
  HTTPError: HTTPError,
  thread: thread,
  socket: socket,
  after: after,
  page: page,
  messageDate: messageDate
};