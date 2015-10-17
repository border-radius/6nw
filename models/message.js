'use strict';

module.exports = function (sequelize, dataTypes) {
  var properties = {
    id: {
      type: dataTypes.STRING,
      primaryKey: true
    },
    type: {
      type: dataTypes.ENUM('post', 'reply', 'recommendation'),
      allowNull: false
    },
    thread: {
      type: dataTypes.STRING,
      allowNull: false
    },
    user: {
      type: dataTypes.STRING,
      allowNull: false
    },
    text: dataTypes.TEXT
  };

  var options = {
    timestamps: true,
    paranoid: true
  };

  return sequelize.define('message', properties, options);
};