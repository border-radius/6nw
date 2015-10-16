var message = require('./message');

exports.schema = {
  required: true,
  type: 'array',
  items: {
    '$ref': '#message'
  },
  minItems: 1
};

exports.options = {
  schemas: {
    message: message.schema
  },
  formats: message.options.formats
};