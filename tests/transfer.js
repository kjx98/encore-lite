//创建web3对象
var Web3 = require('web3');
//var net = require('net');
//var web3complete = require('web3-complete');
//ipcPath = process.env["HOME"] + "/testebc/geth.ipc";
//var web3 = new Web3();
//web3complete(web3);
//web3.setProvider(Web3.providers.IpcProvider(ipcPath, net));
var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
//获取node参数
var arguments = process.argv.splice(2);
var _from = arguments[0];
var _to = arguments[1];
var _value = web3.utils.toWei(arguments[2], "ether");
if (arguments.length < 3) {
  console.log("usage: transfer <fromAcct> <toAcct> <Value>");
  return;
}
if (!web3.utils.isAddress(_from) || !web3.utils.isAddress(_to)){
  console.log('Parameters not a address');
  return;
}
//web3.eth.personal.unlockAccount(_from, "testme");
//转币e
web3.eth.personal.sendTransaction({from: _from, to: _to, value: _value},
  "testme", (err,res)=>{
	if (err) console.log('Error: ', err);
	else console.log('Tx ID: ', res);
});
