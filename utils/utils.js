const crypto = require('crypto');
const keccak256 = require('js-sha3').keccak256;

const buffToStr = b => '0x'+ b.toString('hex');
const random32 = () => crypto.randomBytes(32) ;
const nowInSeconds = () => Math.floor(Date.now()/1000);

const hashPair = () => {
  const secret = random32();
  const hash = keccak256(secret);
  return {
    secret: buffToStr(secret),
    hash: buffToStr(hash)
  }
}

const checkContractArrayToObj = c => {
  return {
    sender: c[0],
    receiver: c[1],
    token: c[2],
    amount: c[3],
    hashlock: c[4],
    timelock: c[5],
    secret: c[6],
    state: c[7]
  }
}

module.exports = {
  buffToStr,
  random32,
  nowInSeconds,
  keccak256,
  hashPair,
  checkContractArrayToObj
}
