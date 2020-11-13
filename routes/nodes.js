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
      name: 'getNodeInfo',
      call: 'admin_nodeInfo',
      params: 0
    }, {
      name: 'getPeers',
      call: 'admin_peers',
      params: 0
    }]
  });

  async.waterfall([
    function(callback) {
      web3.debug.getNodeInfo(function(err, result) {
        if (err) {
          callback(err, null)
          return
        }

        var myNode = {};
        myNode.enode = result.enode.split("?")[0];
        myNode.name = result.name;
        //console.log("nodeInfo: ", result);
        //console.log("myNod: ", myNode);
        callback(err, myNode);
      })
    }, function(myNode, callback) {
      web3.debug.getPeers(function(err, results) {
        if (err) {
          return callback({name:"getPeers", message: "no admin.peers?"});
        }
        //console.log("getPeers: ", results);
        var peers = [];
        for (i=0,len=results.length; i<len; i++) {
          peers.push({"enode": results[i].enode.split("?")[0],
                      "name": results[i].name});
        }
        callback(err, myNode, peers);
      });
    }
  ], function(err, myNode, peers) {
    if (err) {
      return next(err);
    }
    //console.log("peers: ", peers);
    res.render("nodes", { myNode: myNode, peers: peers });
  });
});

module.exports = router;
