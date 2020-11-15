#! /usr/bin/env node
//创建web3对象
var Web3 = require('web3');
var fs = require('fs');
var web3 = new Web3();
//获取node参数
var arguments = process.argv.splice(2);
if (arguments.length < 1) {
  console.log("usage: acctDec <keystore file> [passwd]");
  process.exit();
}
console.log("argc: ", arguments.length);
var _acctFile = arguments[0];
var acctJson = JSON.parse(fs.readFileSync(_acctFile));
var _pwd = "testpass";
if (arguments.length > 1) _pwd = arguments[1];
console.log("Passwd: ", _pwd);
acct = web3.eth.accounts.decrypt(acctJson, _pwd);
console.log('Address: ', acct.address);
console.log('privateKey: ', acct.privateKey);
acct1 = web3.eth.accounts.privateKeyToAccount(acct.privateKey);
if (acct.address != acct1.address) console.log("Address dismatch"); else console.log("match ok");
