const AtomicSwappableToken = artifacts.require("AtomicSwappableToken");
const MultiSigWallet = artifacts.require("MultiSigWallet");
const config = require('../config.json');
const fs = require('fs');

const writeResultToFile = function(network, result) {
  let fileName = `${network}_deployResult.json`;
  fs.writeFileSync(fileName, JSON.stringify(result));
  console.log(`${fileName} write finish`);
}

module.exports = function (deployer, network) {
  // console.log("network: ", network);
  console.log(`=== ${network} ===`);
  deployer.then(async () => {
    const deployResult = config.network[network];
    //console.log("deployResult: ", deployResult);
    for (let i=0; i<deployResult.AtomicSwappableTokens.length; i++) {
      let token = deployResult.AtomicSwappableTokens[i];
      await deployer.deploy(AtomicSwappableToken, token.name, config.ownerSecret);
      token.address = AtomicSwappableToken.address;
      let wallet = token.MultiSigWallet;
      await deployer.deploy(MultiSigWallet, wallet.owners, wallet.required);
      wallet.address = MultiSigWallet.address;
      let tokenInstance = AtomicSwappableToken.at(token.address);
      if(network == "ganache") { // use ganache as main network. give owner 1000 token first.
        await tokenInstance.mint(token.ownerAddress, 1000000000000000000000);
      } else if (network == "develop") {
        // use develop as private network.
        // change controller to multisign wallet, in order to simplify the test
        // the required party need to sign is set to 1, in practice it is necessary
        // to require more than 2 parties to sign when we mint new token on private network
        let changeController = await tokenInstance.changeController(wallet.address);
      }
    }

    return writeResultToFile(network, deployResult);
  });

}
