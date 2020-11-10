var express = require('express');
var router = express.Router();

router.post('/', function(req, res, next) {
  var searchString = req.body.search.trim().toLowerCase();

  if (searchString.length > 22 && searchString.substr(0,2) != '0x')
    searchString = '0x' + searchString;

  if (searchString.length < 22 && !isNaN(searchString.length)) {
    var searchNum = parseInt(searchString);
    if (!isNaN(searchNum) && searchNum >= 0) {
      // Most likely a block number, forward to block id handler
      res.redirect('/block/' + searchNum);
    } else {
      return next({ message: "Error: Invalid search string!" });
    }
  } else if (searchString.length == 66) {
    res.redirect('/tx/' + searchString);
  } else if (searchString.length == 42) {
    res.redirect('/account/' + searchString);
  } else {
    return next({ message: "Error: Invalid search string!" });
  }
});

module.exports = router;
