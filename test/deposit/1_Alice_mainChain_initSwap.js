//use ganache as main chain.

const hashPair = require('../../utils/utils').hashPair;
const nowInSeconds = require('../../utils/utils').nowInSeconds;

const fs = require('fs');

const mainDeployResult= require('../../ganache_deployResult.json');

const tokenAddress=mainDeployResult.AtomicSwappableTokens[0].address;
const walletAddress=mainDeployResult.AtomicSwappableTokens[0].MultiSigWallet.address;

const AtomicSwappableToken = artifacts.require('AtomicSwappableToken').at(tokenAddress);
const MultiSigWallet = artifacts.require('MultiSigWallet').at(walletAddress);

//setup change the token controller to multiSigWallet.
module.exports = async (callback) => {

  let pair = hashPair();
  // write the hashPair for later use
  fs.writeFileSync('./hashPair.json', JSON.stringify(pair));
  console.log("Alice write hashPair");
  //set expiration time as 30 minutes
  let time = nowInSeconds() + 1800;

  // open a request to send 500 token to multiSigWallet as a reserver, to simply the test
  // the required signature for the multisig wallet is set to 1. we can always require more
  // parties to join in the multisig to increase the credibility.
  let open = await AtomicSwappableToken.open(
    walletAddress,
    pair.hash,
    time,
    500000000000000000000
  );
  let NewHashLockContract = open.logs[1].args;
  fs.writeFileSync('./NewHashLockContract.json', JSON.stringify(NewHashLockContract));
  console.log("Alice write NewHashLockContract");

  let val = await AtomicSwappableToken.balanceOf.call(tokenAddress);
  console.log("mainchain AtomicSwappableToken.balanceOf: ", val.toNumber());
  callback();

}
