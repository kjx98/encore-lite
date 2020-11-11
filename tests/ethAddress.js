var Web3 = require('web3');
console.log(Web3.version);
//设置web3对象
var web3 = new Web3('http://127.0.0.1:8545/');//encore正式网络节点地址

//获取当前区块高度
function getBlockNumber () {
    web3.eth.getBlockNumber().then(
    function(result){
        console.log("blockNumber:"+result);
        throughBlock(result);
    })
}

//从创世区块0开始遍历
function throughBlock (blockNumber) {
    if (!blockNumber) {console.log('blockNumber is 0');return false;};
    for (var i = 0; i < blockNumber; i++) {
        getBlock(i);
    };
}

//获取当前区块的信息
function getBlock (blockNumber) {
    web3.eth.getBlock(blockNumber).then(
        function(result){
            transactions = result.transactions;
            for (var i = 0; i < transactions.length; i++) {
                getTransactions(transactions[i]);
            }
        });
}

//获取交易信息
function getTransactions (txh) {
    web3.eth.getTransaction(txh).then(
        function(result){
            from = result.from;
            to = result.to;
            getCode(from);
            getCode(to);
    });
}

// 验证地址是否是合约地址
function getCode (address) {
    if (!address) {return false;};
    web3.eth.getCode(address).then(
        function(result){
            if (result == '0x') {
                getBalance(address);                
            };          
    });
}

// 获取地址余额
function getBalance (address) {
    web3.eth.getBalance(address).then(
        function(result){
            if (!addressList.includes(address)) {
                addressList.push(address);
                console.log(address+"\t"+result); //地址 余额
            };          
        });
}

getBlockNumber();
