var express = require('express');
var router = express.Router();

var async = require('async');
var Web3 = require('web3');
var web3complete = require('web3-complete');
var util = require('ethereumjs-util');

router.get('/:offset?', function(req, res, next) {
  var config = req.app.get('config');
  var web3 = new Web3();
  var maxAccts = 16;
  var nAccts = 0;
  web3complete(web3);
  web3.setProvider(config.provider);

  web3.extend({
    property: 'debug',
    methods:[{
      name: 'accountRange',
      call: 'debug_accountRange',
      params: 6,
      inputFormatter: [web3.extend.formatters.inputBlockNumberFormatter,
                      null, null, null, null, null ],
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
      web3.eth.getBlock('latest', function(err, result) {
        if (err) {
          callback(err, null)
          return
        }

        let offset = req.params.offset
        if (offset) {
          // offset is hash of the address
          //offset = '0x' + util.keccak256(offset).toString('hex')
          offset = util.keccak256(offset).toString('base64')
        } else {
          // starting offset should be 0x00...
          //offset = '0x' + Buffer.alloc(32).toString('hex')
          offset = Buffer.alloc(32).toString('base64')
        }

        console.log(req.params.offset, offset);

        // accountRange params: block number or "latest", start address hash, max results
		// offset should be base64 code
        // accountRangeAt params: block number or "latest", tx index, start address hash, max results
        //result = Object.values(result.addressMap);
        web3.debug.accountRange(result.number, offset, maxAccts+5, function(err, result) {
          if (err) {
            callback(err, null)
            return
          }
          callback(err, result);
        });
      })
    }, function(accounts, callback) {

      var data = {};
      if (! req.params.offset ) for (acct in config.names) {
        //accounts.push(acct);
        accounts.unshift(acct);
      };
      if (!accounts) {
        return callback({name:"FatDBDisabled", message: "FatDB system is not enabled. Please restart Geth/encore with the --fat-db=on parameter."});
      }
      
      if (accounts.length === 0) {
        return callback({name:"NoAccountsFound", message: "Chain contains no accounts."});
      }
      
      var lastAccount = accounts[accounts.length - 1];
      nAccts = accounts.length;
      
      async.eachSeries(accounts, function(account, eachCallback) {
        account = util.toChecksumAddress(account);
        web3.eth.getCode(account, function(err, code) {
          if (err) {
            return eachCallback(err);
          }
          data[account] = {};
          data[account].address = account;
          //if (account in config.names) data[account].type = "Contract"; else
          if (account.substr(0,30) == '0x0000000000000000000000000000')
            data[account].type = "Contract"; else
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
    //console.log("count accounts: ", nAccts, " maxAccts: ", maxAccts);
    if (nAccts < maxAccts) {
      // console.log("render accounts_last");
      lastAccount =  null;
    }
    //console.log("lastAccount: ", lastAccount);
    res.render("accounts", { accounts: accounts, lastAccount: lastAccount });
  });
});

module.exports = router;
