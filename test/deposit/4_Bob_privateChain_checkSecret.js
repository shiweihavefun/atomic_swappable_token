const fs = require('fs');
const privateDeployResult= require('../../develop_deployResult.json');

const tokenAddress=privateDeployResult.AtomicSwappableTokens[0].address;
const AtomicSwappableToken = artifacts.require('AtomicSwappableToken').at(tokenAddress);

const CounterPartHashLockContract = require('../../CounterPartHashLockContract.json');

module.exports = async (callback) => {

  let contractId = CounterPartHashLockContract.contractId;

  let checkContract = await AtomicSwappableToken.checkContract.call(contractId);
  CounterPartHashLockContract.secret=checkContract[5];

  fs.writeFileSync('./CounterPartHashLockContract.json', JSON.stringify(CounterPartHashLockContract));
  console.log("Bob update CounterPartHashLockContract secret: ", CounterPartHashLockContract.secret);
  callback();

}
