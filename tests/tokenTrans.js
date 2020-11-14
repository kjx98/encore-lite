var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

var arguments = process.argv.splice(2);
var _from = arguments[0];	//发币者也是合约函数调用者
var _to = arguments[1];
var _value = arguments[2];

//创建合约实例
var abi = [{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"balances","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"toAdd","type":"address"},{"name":"amount","type":"uint256"}],"name":"send","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"initalSupply","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"from","type":"address"},{"indexed":false,"name":"to","type":"address"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"Sent","type":"event"}];
var CoinContract = web3.eth.contract(abi);
var contractAddress = '0x767b276a86d36b66830a95720513e26a0773ca0c';
var contractInstance = CoinContract.at(contractAddress);

//调用转币函数
contractInstance.send(_to, _value, {from: _from}, (err,res)=>{
	if (err)
		console.log('Error: ', err);
	else
		console.log('Result: ', res);
})
