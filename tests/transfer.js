#! /usr/bin/env node
//创建web3对象
var Web3 = require('web3');
var net = require('net');
var web3complete = require('web3-complete');
ipcPath = process.env["HOME"] + "/testebc/geth.ipc";
var web3 = new Web3();
web3complete(web3);
web3.setProvider(new Web3.providers.IpcProvider(ipcPath, net));
//var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
//获取node参数
var arguments = process.argv.splice(2);
if (arguments.length < 3) {
  console.log("usage: transfer <fromAcct> <toAcct> <Value> [passwd]");
  process.exit();
}
var _from = arguments[0];
var _to = arguments[1];
var _value = web3.utils.toWei(arguments[2], "ether");
var _pwd = "testpass";
if (arguments.length > 3) _pwd = arguments[3];
//console.log("Passwd: ", _pwd);
/*
console.log("gasPrice: ", web3.eth.gasPrice);
web3.eth.getGasPrice((err,res)=>{
  console.log("err: ", err, "result: ", res);
});
console.log("Gwei: ", web3.utils.toWei('1', "Gwei"));
*/
if (!web3.utils.isAddress(_from) || !web3.utils.isAddress(_to)){
  console.log('Parameters not a address');
  process.exit();
}
//web3.eth.personal.unlockAccount(_from, _pwd);
//转币e
web3.eth.personal.sendTransaction({from: _from, to: _to, value: _value},
  _pwd, (err,res)=>{
  if (err) console.log('Error: ', err);
  else console.log('Tx ID: ', res);
  process.exit();
});
