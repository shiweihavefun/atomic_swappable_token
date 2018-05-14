pragma solidity ^0.4.21;

contract AtomicSwappableTokenInterface {

  bytes32 public ownerSignatureHash;  //hash value of owner's secret.

  function open (address _receiver, bytes32 _hashlock, uint _timelock, uint _amount) public returns (bytes32 contractId);

  function close(bytes32 _contractId, bytes32 _secret) public returns (bool);

  function refund(bytes32 _contractId) public returns (bool);

  function checkContract(bytes32 _contractId) public view returns (
        address sender,
        address receiver,
        uint amount,
        bytes32 hashlock,
        uint timelock,
        bytes32 secret
      );

  event NewHashLockContract (
    bytes32 indexed contractId,
    address indexed sender,
    address indexed receiver,
    uint amount,
    bytes32 hashlock,
    uint timelock
  );

  event SwapClosed(bytes32 indexed contractId);
  event SwapRefunded(bytes32 indexed contractId);


}
