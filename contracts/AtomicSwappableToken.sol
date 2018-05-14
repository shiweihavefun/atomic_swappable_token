pragma solidity ^0.4.21;

import 'openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol';
import './AtomicSwappableTokenInterface.sol';

contract AtomicSwappableToken is StandardToken, AtomicSwappableTokenInterface {

  string public name;               //The shoes name: e.g. shining shoes
  uint8 public decimals;           //Number of decimals of the smallest unit

  address public controller;

  struct HashLockContract {
    address sender;
    address receiver;
    uint amount;
    bytes32 hashlock;
    uint timelock;
    bytes32 secret;
    States state;
  }

  enum States {
    INVALID,
    OPEN,
    CLOSED,
    REFUNDED
  }

  mapping (bytes32 => HashLockContract) private contracts;

  event Mint(address indexed _to, uint _amount);

  modifier onlyController { require(msg.sender == controller); _; }

  modifier futureTimelock(uint _time) {
    // only requirement is the timelock time is after the last blocktime (now).
    // probably want something a bit further in the future then this.
    // but this is still a useful sanity check:
    require(_time > now);
    _;
  }

  modifier contractExists(bytes32 _contractId) {
    require(_contractExists(_contractId));
    _;
  }

  modifier hashlockMatches(bytes32 _contractId, bytes32 _secret) {
    require(contracts[_contractId].hashlock == keccak256(_secret));
    _;
  }

  modifier closable(bytes32 _contractId) {
    require(contracts[_contractId].state == States.OPEN);
    require(contracts[_contractId].timelock > now);
    _;
  }

  modifier refundable(bytes32 _contractId) {
    require(contracts[_contractId].state == States.OPEN);
    require(contracts[_contractId].timelock <= now);
    _;
  }


  constructor (string _name, bytes32 _ownerSecret) public {
    name = _name;
    decimals = 18;
    controller = msg.sender;
    ownerSignatureHash = keccak256(_name, _ownerSecret);
  }


  /// @notice Changes the controller of the contract
  /// @param _newController The new controller of the contract
  function changeController(address _newController) public onlyController {
    controller = _newController;
  }


  function mint(address _to, uint _amount) public onlyController returns (bool) {
    totalSupply_ = totalSupply_.add(_amount);
    balances[_to] = balances[_to].add(_amount);
    emit Mint(_to, _amount);
    emit Transfer(address(0), _to, _amount);
  }

  function mintAndOpen(
    address _receiver,
    bytes32 _hashlock,
    uint _timelock,
    uint _amount
  ) public
    onlyController
    futureTimelock(_timelock)
    returns (bytes32 contractId)
  {
    contractId = keccak256 (
      msg.sender,
      _receiver,
      _amount,
      _hashlock,
      _timelock
    );

    // the new contract must not exist
    require(!_contractExists(contractId));

    // mint new token if there is not enough tokens locked in the contract.
    if(_amount > balanceOf(address(this))) {
      uint mintAmount = _amount.sub(balanceOf(address(this)));
      totalSupply_ = totalSupply_.add(mintAmount);
      balances[address(this)] = balances[address(this)].add(mintAmount);
      emit Mint(address(this), mintAmount);
      emit Transfer(address(0), address(this), mintAmount);
    }

    contracts[contractId] = HashLockContract(
      msg.sender,
      _receiver,
      _amount,
      _hashlock,
      _timelock,
      0x0,
      States.OPEN
    );

    emit NewHashLockContract(contractId, msg.sender, _receiver, _amount, _hashlock, _timelock);
  }

  function open (
    address _receiver,
    bytes32 _hashlock,
    uint _timelock,
    uint _amount
  ) public
    futureTimelock(_timelock)
    returns (bytes32 contractId)
  {
    contractId = keccak256 (
      msg.sender,
      _receiver,
      _amount,
      _hashlock,
      _timelock
    );

    // the new contract must not exist
    require(!_contractExists(contractId));

    // transfer token to this contract
    require(transfer(address(this), _amount));

    contracts[contractId] = HashLockContract(
      msg.sender,
      _receiver,
      _amount,
      _hashlock,
      _timelock,
      0x0,
      States.OPEN
    );

    emit NewHashLockContract(contractId, msg.sender, _receiver, _amount, _hashlock, _timelock);
  }

  function close(bytes32 _contractId, bytes32 _secret)
    public
    contractExists(_contractId)
    hashlockMatches(_contractId, _secret)
    closable(_contractId)
    returns (bool)
  {
    HashLockContract storage c = contracts[_contractId];
    c.secret = _secret;
    c.state = States.CLOSED;
    require(this.transfer(c.receiver, c.amount));
    emit SwapClosed(_contractId);
    return true;
  }

  function refund(bytes32 _contractId)
    public
    contractExists(_contractId)
    refundable(_contractId)
    returns (bool)
  {
    HashLockContract storage c = contracts[_contractId];
    c.state = States.REFUNDED;
    require(this.transfer(c.sender, c.amount));
    emit SwapRefunded(_contractId);
    return true;
  }

  function _contractExists(bytes32 _contractId) internal view returns (bool exists) {
    exists = (contracts[_contractId].sender != address(0));
  }

  function checkContract(bytes32 _contractId)
    public
    view
    contractExists(_contractId)
    returns (
      address sender,
      address receiver,
      uint amount,
      bytes32 hashlock,
      uint timelock,
      bytes32 secret
    )
  {
    HashLockContract memory c = contracts[_contractId];
    return (
      c.sender,
      c.receiver,
      c.amount,
      c.hashlock,
      c.timelock,
      c.secret
    );
  }
}
