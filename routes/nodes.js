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
    },{
      name: 'getSigners',
      call: 'clique_getSigners',
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
        enode = result.enode.split(":");
        myNode.enode = enode[0]+':'+enode[1];
        myNode.name = result.name.split("-")[0].split("/")[1];
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
          enode = results[i].enode.split(":");
          ver = results[i].name.split("-")[0].split("/")[1];
          peers.push({"enode": enode[0]+':'+enode[1],
                      "name": ver});
        }
        callback(err, myNode, peers);
      });
    }, function(myNode, peers, callback) {
      web3.debug.getSigners((err,signers) => {
        if (err) {
          return callback({name:"getSigners", message: "no clique.getSigners?"});
        }
        callback(err, myNode, peers, signers);
      });
    }
  ], function(err, myNode, peers, signers) {
    if (err) {
      return next(err);
    }
    //console.log("peers: ", peers);
    //console.log("Signers: ", signers);
    res.render("nodes", { myNode: myNode, peers: peers, signers: signers });
  });
});

module.exports = router;
