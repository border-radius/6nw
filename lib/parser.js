var request = require('request');

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

  if (!/^[A-Z0-9]{6}$/.test(messageId)) {
    return next(new Error('Invalid message id'));
  }

  var messages = [];

  request({
    url: 'https://bnw.im/api/show?replies=1&message=' + messageId,
    json: true
  }, function (e, res, body) {
    if (!e && (res.statusCode < 200 || res.statusCode >= 300)) {
      e = new Error('HTTP ' + res.statusCode);
    }

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
      updatedAt: new Date((body.replies.slice(-1) || body.message).date * 1000)
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
      messages.push({
        id: reply.id,
        type: 'reply',
        thread: body.message.id,
        user: reply.user,
        text: reply.text,
        createdAt: new Date(reply.date * 1000),
        updatedAt: new Date(reply.date * 1000)
      });
    });

    return next(null, messages);
  });
}

module.exports = {
  thread: thread,
  socket: socket
};