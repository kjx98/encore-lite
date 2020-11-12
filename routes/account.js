var express = require('express');
var router = express.Router();
var util   = require('ethereumjs-util');

var async = require('async');
var Web3 = require('web3');
var web3complete = require('web3-complete');

var EWASM_BYTES = '0x0061736d01';
var nodeVersion = '';


router.get('/:account', function(req, res, next) {

  var config = req.app.get('config');
  var web3 = new Web3();
  if (config.blockCount < 32) config.blockCount = 32;
  web3complete(web3);
  web3.setProvider(config.provider);

  var db = req.app.get('db');

  var data = {};

  nodeVersion = req.app.locals.nodeStatus.version;

  async.waterfall([
    function(callback) {
      web3.eth.getBlock("latest", false, function(err, result) {
        callback(err, result);
      });
    }, function(lastBlock, callback) {
      data.lastBlock = lastBlock.number;
      data.lastBlockHash = lastBlock.hash;

      if (data.lastBlock > config.blockCount) {
        data.fromBlock = data.lastBlock - config.blockCount;
      } else {
        data.fromBlock = 0x00;
      }
      web3.eth.getBalance(req.params.account, function(err, balance) {
        callback(err, balance);
      });
    }, function(balance, callback) {
      data.balance = balance;
      web3.eth.getCode(req.params.account, function(err, code) {
        callback(err, code);
      });
    }, function(code, callback) {
      data.code = code;
      data.code_length = (code.length / 2) - 1;
      data.wast = false;
      if (code !== "0x") {
        data.isContract = true;

        if (code.substring(0,12) === EWASM_BYTES) {
          data.wast = true;
          console.log(req.params.account, " is ewasm contract");
        }

        web3.debug.storageRangeAt(data.lastBlockHash, 0, req.params.account, '0x00', 1000, function(err, result) {
          if (err) {
            callback(err);
          } else {
            callback(null, result.storage);
          }
        })
      } else {
        callback(null, null);
      }
   }, function(storage, callback) {
      if (storage) {
        var listOfStorageKeyVals = Object.values(storage);
        data.storage = listOfStorageKeyVals;
      }

      // fetch verified contract source from db
      var account = util.toChecksumAddress(req.params.account);
      db.get(account, function(err, value) {
        callback(null, value);
      });
    }, function(source, callback) {

      if (source) {
        data.source = JSON.parse(source);

        data.contractState = [];
        if (!data.source.abi) {
          return callback();
        }
        var abi = JSON.parse(data.source.abi);
        var contract = web3.eth.contract(abi).at(req.params.account);

        async.eachSeries(abi, function(item, eachCallback) {
          if (item.type === "function" && item.inputs.length === 0 && item.constant) {
            try {
              contract[item.name](function(err, result) {
                data.contractState.push({ name: item.name, result: result });
                eachCallback();
              });
            } catch(e) {
              console.log(e);
              eachCallback();
            }
          } else {
            eachCallback();
          }
        }, function(err) {
          callback(err);
        });

      } else {
        callback();
      }

    }, function(callback) {
      var blocks = [];
 
      var blockCount = config.blockCount;
      var address = req.params.account;
      if (blockCount < 128) blockCount = 128;

      if (nodeVersion.includes('aleth')) {
        if(!address.includes('0x')) {
          address = '0x' + address;
        }
        if (data.lastBlock < blockCount) {
          blockCount = data.lastBlock;
        }
      }
      address = util.toChecksumAddress(address);

      var traces = [];

      if (data.lastBlock - blockCount < 0) {
        blockCount = data.lastBlock + 1;
      }

      async.times(blockCount, function(n, next) {
        // n undefined?
        if (n) {
          //console.log("sync time number", n);
        } else n = 0;
        web3.eth.getBlock(data.lastBlock - n, true, function(err, block) {
          next(err, block);
        });
      }, function(err, blocks) {
        if (err) {
          return next(err);
        }

        blocks.forEach(function(block) {
          block.transactions.forEach(function(e) {
            if (!e.to) {
              e.to = '';
            }
            e.from = util.toChecksumAddress(e.from);
            e.to = util.toChecksumAddress(e.to);
            if (address == e.from || address == e.to) {
              traces.push(e);
            }
          });
        });
        callback(null, traces);
      });
    }
  ], function(err, traces) {
    if (err) {
      return next(err);
    }

    var tracesSent = [];
    var tracesReceived = [];

    data.address = req.params.account;

    // aleth doesn't includes 0x in address
    if (!data.address.includes('0x')) {
      data.address = '0x' + data.address;
    }
    data.address = util.toChecksumAddress(data.address);

    traces.forEach(function(trace) {
      trace.from = util.toChecksumAddress(trace.from);
      trace.to = util.toChecksumAddress(trace.to);
      if (trace.from == data.address) {
        tracesSent.push(trace);
      } else {
        tracesReceived.push(trace);
      }
    });

    data.tracesSent = tracesSent;
    data.tracesReceived = tracesReceived;

    var blocks = {};
    data.tracesSent.forEach(function(trace) {
      if (!blocks[trace.blockNumber]) {
        blocks[trace.blockNumber] = [];
      }

      blocks[trace.blockNumber].push(trace);
    });
    data.tracesReceived.forEach(function(trace) {
      if (!blocks[trace.blockNumber]) {
        blocks[trace.blockNumber] = [];
      }

      blocks[trace.blockNumber].push(trace);
    });

    data.tracesSent = null;
    data.tracesReceived = null;

    data.blocks = [];
    var txCounter = 0;
    for (var block in blocks) {
      data.blocks.push(blocks[block]);
      txCounter++;
    }

    if (data.source) {
      data.name = data.source.name;
    } else if (config.names[data.address]) {
      data.name = config.names[data.address];
    }

    data.blocks = data.blocks.reverse().splice(0, 100);
    res.render('account', { account: data });
  });

});

module.exports = router;
