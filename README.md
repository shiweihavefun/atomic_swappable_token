# Atomic Swappable Token: 
This repository shows an implementation of ERC20 token extension which provide an additional functionality for cross-chain trading. 

## Smart contracts 
AtomicSwappableTokenInterface.sol define the token interface in addition to ERC20 token standard. 

AtomicSwappableToken.sol shows an implementation of the token interface. 

MultiSigWallet.sol is used as the controller of AtomicSwappableToken to submit mint token transactions. 

## Use case 
A use case discussion is described in the file:
[Decentralized Cross Chain Token Exchange Based on Atomic Swap]

Consider Alice is a project owner on mainnet. She would like to list her token on Bob's blockchain trading platform. 
 
The following test shows how Alice and Bob works together to swap token from mainnet to Bob’s platform.  

1. launch ganache, use ganache as a mainnet. 

2. deploy contracts on ganache 
```sh
    truffle.cmd migrate --reset --network ganache
```
3. Alice request to deposit her token from mainnet to a multisig wallet owned by Alice and Bob. 
```sh
    truffle.cmd exec --network ganache .\test\deposit\1_Alice_mainChain_initSwap.js
```
4. launch a new terminal, deploy contract on private chain run: 
```sh
    truffle.cmd develop
    migrate --reset
```
5. Bob open a counterpart hashlockcontract using the hashlock provided by Alice. 
```sh
    exec ./test/deposit/2_Bob_privateChain_openCounterPart.js 
```
6. Alice submit her secret on the privatechain to claim her token on the private network.
```sh
    exec ./test/deposit/3_Alice_privateChain_submitSecret.js
```
7. Bob check Alice's secret on private chain and save it, it can be used to claim the token on Mainnet. 
```sh
    exec ./test/deposit/4_Bob_privateChain_checkSecret.js 
```
8. Bob (or Alice) can submit the secret on mainnet, Alice's token will be deposit in to the multisig wallet on Mainnet, in the first terminal run 
```sh
    truffle.cmd exec --network ganache .\test\deposit\5_Bob_mainChain_submitSecret.js 
```

[Decentralized Cross Chain Token Exchange Based on Atomic Swap]: <https://github.com/shiweihavefun/atomic_swappable_token/blob/master/Decentralized%20Cross%20Chain%20Token%20Exchange%20Based%20on%20Atomic%20Swap.pdf>
