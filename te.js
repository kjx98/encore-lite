var Web3 = require('web3')
var moment = require('moment');
var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))
web3.eth.getAccounts(console.log);
console.log(web3.eth.accounts)
console.log('OK')
var version = web3.version.node;
console.log(version);
console.log('First block date', moment(1585633211000).format());
