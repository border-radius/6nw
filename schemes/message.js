exports.schema = {
  required: true,
  type: 'object',
  additionalProperties: false,
  properties: {
    id: {
      required: true,
      type: 'string',
      format: 'bnwid'
    },
    type: {
      required: true,
      type: 'string',
      format: 'bnwtype'
    },
    thread: {
      required: true,
      type: 'string',
      format: 'bnwpostid'
    },
    parent: {
      type: 'string',
      format: 'bnwid'
    },
    user: {
      required: true,
      type: 'string'
    },
    text: {
      type: 'string'
    },
    createdAt: {
      required: true,
      type: 'object',
      format: 'dateobject'
    },
    updatedAt: {
      required: true,
      type: 'object',
      format: 'dateobject'
    },
    deletedAt: {
      type: 'object',
      format: 'dateobject'
    }
  }
};

exports.options = {
  formats: {
    bnwid: /^[A-Z0-9]{6}(\/[\@A-z0-9\-]{3,})?$/,
    bnwpostid: /^[A-Z0-9]{6}$/,
    bnwtype: /^(post|reply|recommendation)$/,
    dateobject: function (obj) {
      return obj instanceof Date;
    }
  }
};