const mainDeployResult= require('../../ganache_deployResult.json');

const tokenAddress=mainDeployResult.AtomicSwappableTokens[0].address;
const AtomicSwappableToken = artifacts.require('AtomicSwappableToken').at(tokenAddress);

const NewHashLockContract = require('../../NewHashLockContract.json');
const CounterPartHashLockContract = require('../../CounterPartHashLockContract.json');
module.exports = async (callback) => {

  let contractId = NewHashLockContract.contractId;
  let secret = CounterPartHashLockContract.secret;

  let close = await AtomicSwappableToken.close(contractId, secret);
  console.log("Bob used the secret from Alice and closed the swap in mainnet");

  const receiver = NewHashLockContract.receiver;
  let val = await AtomicSwappableToken.balanceOf.call(receiver);
  console.log(`mainchain AtomicSwappableToken.balanceOf(${receiver}): `, val.toNumber());

  callback();
}
