var express = require('express');
var router = express.Router();

var launched = new Date();

router.get('/', function (req, res, next) {
  res.json({
    uptime: new Date() - launched
  });
});

module.exports = router;
