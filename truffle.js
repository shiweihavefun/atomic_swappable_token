const HDWalletProvider = require("truffle-hdwallet-provider");
const config = require('./config.json');
let provider

function getMemonic() {
  try{
    return require('fs').readFileSync("Seed", "utf8").trim();
  } catch(err){
    return "";
  }
}

function getProvider(rpcUrl) {
  if (!provider) {
    console.log("memonic: ", getMemonic());
    console.log("url: ", rpcUrl);
    provider = new HDWalletProvider(getMemonic(), rpcUrl)
  }
  return provider
}


module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    develop: {
      host: "127.0.0.1",
      port: 9545,
      network_id: "*", // match any netowkr id
      gas: 4612388
    },
    ganache: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*"
    },
    rinkeby: {
      // from: config.rinkeby_account, // shiwei rinkeby account
      network_id: 4,
      provider: function () {
        return getProvider(config.rinkeby_url);
      }
    },
    live: {
      network_id: 1,
      host: "127.0.0.1",
      port: 8545
    }
  }
};
