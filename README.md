# EncoreChain explorer Lite
### Lightweight blockchain explorer for EncoreChain

Encore Lite forked from etherchain-light of EWASM project[https://github.com/ewasm/etherchain-light.git] is an Encore(Ethereum also) blockchain explorer built with NodeJS and Express. It does not require an external database and retrieves all information on the fly from a backend Ethereum node.

While there are several excellent Ethereum blockchain explorers available (etherscan, ether.camp and etherchain) they operate on a fixed subset of Ethereum networks, usually the mainnet and testnet. Currently there are no network agnostic blockchain explorers available. If you want to develop Dapps on a private testnet or would like to launch a private / consortium network, Ether Lite will allow you to quickly explore such chains.

A demo instance connected to the Encore testnet is available at [lite.anchor.run](http://lite.anchor.run). An example of a verified contract source can be found at [0x0cf37d2d45427a1380db12c9b352d6f083143817](https://lite.anchor.run/account/0x0cf37d2d45427a1380db12c9b352d6f083143817). An example of a transaction where the corresponding Solidity function name and parameters have been identified can be found at [0x82da63f3d998415b748111e6f1d11051167fb995fdca990acd3cfd5a8b397c20](https://lite.anchor.run/tx/0x82da63f3d998415b748111e6f1d11051167fb995fdca990acd3cfd5a8b397c20)

## Current Features
* Browse blocks, transactions, accounts and contracts
* View pending transactions
* Display contract internal calls (call, create, suicide)
* Upload & verify contract sources
* Show Solidity function calls & parameters (for contracts with available source code)
* Display the current state of verified contracts
* Named accounts
* Advanced transaction tracing (VM Traces & State Diff)
* View failed transactions
* Live Backend Node status display
* Submit signed Transactions to the Network
* Support for all [Bootswatch](https://bootswatch.com/) skins
* Accounts enumeration
* Signature verification
* Supports IPC and HTTP backend connections
* Responsive layout

## Planned features
* ERC20 Token support

Missing a feature? Please request it by creating a new [Issue](https://github.com/kjx98/encore-lite/issues).

## Usage notes
This blockchain explorer is intended for EncoreChain(private Ethereum chains also). Some of those calls are ressource intensive (e.g. retrieval of the full tx list of an account) and do not scale well for acounts with a huge number of transactions. We currently develop the explorer using the EncoreChain testnet but it will work with every compatible Ethereum network configuration. The explorer is still under heavy development, if you find any problems please create an issue or prepare a pull request.

## Getting started

### Setup from source

Supported OS: Ubuntu 16.04

Supported Ethereum backend nodes: Encore (Geth is currently not supported as it does not allow account and received/sent tx enumeration)

1. Setup a nodejs & npm environment
2. Install the latest version of the Encore Ethereum client
3. Start parity using the following options: `encore --chain=<yourchain> --tracing=on --fat-db=on --pruning=archive`
4. Clone this repository to your local machine: `git clone https://github.com/kjx98/encore-lite`
5. Install all dependencies: `npm install`
6. Rename `config.js.example` into `config.js` and adjust the file to your local environment
7. Start the explorer: `npm start`
8. Browse to `http://localhost:3000`

### Setup using docker

Build then run the container
```bash
docker build -t encore-lite .
docker run -p 3000:3000 encore-lite
```

Or directly bind the config.js file to avoid rebuilding the image
```bash
docker run -p "3000:3000" \
    -v "$(pwd)/config.js":/usr/src/app/config.js \
    encore-lite
```

### Setup using docker-compose

```bash
docker-compose up
```
