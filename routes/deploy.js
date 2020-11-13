var express = require('express');
var router = express.Router();

var async = require('async');

router.get('/', function(req, res, next) {
  var config = req.app.get('config');
  var data = {};
  data.chainId = config.chainId;
  data.rpcUrlSuggestion = config.rpcUrlSuggestion;

  res.render('deploy', {data: data});
});

module.exports = router
