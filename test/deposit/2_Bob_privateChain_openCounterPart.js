const nowInSeconds = require('../../utils/utils').nowInSeconds;
const fs = require('fs');

//use truffle develop as the private chain.
const privateDeployResult = require('../../develop_deployResult.json');
//get deployed token and wallet address
const tokenAddress=privateDeployResult.AtomicSwappableTokens[0].address;
const walletAddress=privateDeployResult.AtomicSwappableTokens[0].MultiSigWallet.address;

const AtomicSwappableToken = artifacts.require('AtomicSwappableToken').at(tokenAddress);
const MultiSigWallet = artifacts.require('MultiSigWallet').at(walletAddress);

const receiverAddress = "0x627306090abab3a6e1400e9345bc60c78a8bef57";

module.exports = async (callback) => {

  //set expiration time as 30 minutes
  let time = nowInSeconds() + 1800;
  let hashLockContract = require('../../NewHashLockContract.json');

  // get mintAndOpenData,  mint same number of tokens as Alice request to swap on the private chain
  const mintAndOpenData =AtomicSwappableToken.mintAndOpen
                        .request(
                          receiverAddress,
                          hashLockContract.hashlock,
                          time,
                          hashLockContract.amount
                        ).params[0].data;

  let NewHashLockContractEvent = AtomicSwappableToken.NewHashLockContract();
  let CounterPartHashLockContract;

  // submit request from wallet address
  let mintAndOpen = await MultiSigWallet.submitTransaction(tokenAddress,0,mintAndOpenData);

  NewHashLockContractEvent.watch((error, result) =>{
    if(!error){
      if(CounterPartHashLockContract == undefined) {
        CounterPartHashLockContract = result.args;
        fs.writeFileSync('./CounterPartHashLockContract.json', JSON.stringify(CounterPartHashLockContract));
        console.log("Bob write CounterPartHashLockContract");
      }
    } else {
      console.log("NewHashLockContractEvent error: ", JSON.stringify(error));
    }
  });

  let val = await AtomicSwappableToken.balanceOf.call(tokenAddress);
  console.log(`private chain AtomicSwappableToken.balanceOf(${tokenAddress}): `, val.toNumber());
  callback();

}
