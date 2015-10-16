var fs = require('fs');
var path = require('path');
var validator = require('is-my-json-valid');

var basename = path.basename(module.filename);

var schemes = {};

fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(function(file) {
    var name = file.slice(0, -3);
    var schema = require(path.join(__dirname, file));

    var validate = validator(schema.schema, schema.options);

    schemes[name] = function (data, next) {
      var errors = null;

      if (!validate(data)){
        errors = new Error(validate.errors.map(function (error) {
          return '"' + error.field + '" ' + error.message;
        }).join('; '));
      }

      next(errors);
    };
  });

module.exports = schemes;