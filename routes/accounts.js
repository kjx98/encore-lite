var express = require('express');
var router = express.Router();

var async = require('async');
var Web3 = require('web3');
var web3complete = require('web3-complete');
var util = require('ethereumjs-util');

router.get('/:offset?', function(req, res, next) {
  var config = req.app.get('config');  
  var web3 = new Web3();
  web3complete(web3);
  web3.setProvider(config.provider);

  web3.extend({
    property: 'debug',
    methods:[{
      name: 'accountRange',
      call: 'debug_accountRange',
      params: 6,
      inputFormatter: [web3.extend.formatters.inputBlockNumberFormatter, null, null, null, null, null ],
      outputFormatter: function(res) {
        var formatted = [];
        for (k in res.accounts) {
          formatted.push(k);
        }
        return formatted;
      }
    }]
  });

  async.waterfall([
    function(callback) {
      // accountRange params: block number or "latest", tx index, max results
      // web3.eth.getAccounts(function(err, result) {
      web3.debug.accountRange(0, null, 32, function(err, result) {
        console.log("Get accts: ", result);
        callback(err, result);
      });
    }, function(accounts, callback) {
      
      var data = {};
      
      if (!accounts) {
        return callback({name:"FatDBDisabled", message: "Parity FatDB system is not enabled. Please restart Parity with the --fat-db=on parameter."});
      }
      
      if (accounts.length === 0) {
        return callback({name:"NoAccountsFound", message: "Chain contains no accounts."});
      }
      
      var lastAccount = accounts[accounts.length - 1];
      
      async.eachSeries(accounts, function(account, eachCallback) {
        account = util.toChecksumAddress(account);
        web3.eth.getCode(account, function(err, code) {
          if (err) {
            return eachCallback(err);
          }
          data[account] = {};
          data[account].address = account;
          data[account].type = code.length > 2 ? "Contract" : "Account";
          
          web3.eth.getBalance(account, function(err, balance) {
            if (err) {
              return eachCallback(err);
            }
            data[account].balance = balance;
            eachCallback();
          });
        });
      }, function(err) {
        callback(err, data, lastAccount);
      });
    }
  ], function(err, accounts, lastAccount) {
    if (err) {
      return next(err);
    }
    
    res.render("accounts", { accounts: accounts, lastAccount: lastAccount });
  });
});

module.exports = router;
