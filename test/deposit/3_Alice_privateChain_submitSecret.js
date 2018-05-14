const privateDeployResult= require('../../develop_deployResult.json');
const tokenAddress=privateDeployResult.AtomicSwappableTokens[0].address;
const AtomicSwappableToken = artifacts.require('AtomicSwappableToken').at(tokenAddress);

const hashPair = require('../../hashPair.json');
const CounterPartHashLockContract = require('../../CounterPartHashLockContract.json');

module.exports = async (callback) => {

  let close = await AtomicSwappableToken.close(CounterPartHashLockContract.contractId, hashPair.secret);
  console.log("Alice submitted secret and closed swap on privateChain");

  const receiver = CounterPartHashLockContract.receiver;
  let val = await AtomicSwappableToken.balanceOf.call(receiver);
  console.log(`private chain AtomicSwappableToken.balanceOf(${receiver}): `, val.toNumber());
  callback();
}
