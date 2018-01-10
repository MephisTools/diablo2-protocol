const getHash = require('./getHash');

const clientToken=18226750;
const serverToken=1515471831;
const passwd="bzkl12";

const expectedPasswordHash = new Buffer([
  209,
  191,
  200,
  138,
  138,
  129,
  17,
  9,
  224,
  15,
  179,
  176,
  152,
  190,
  71,
  27,
  95,
  95,
  94,
  84
]);


const hash = getHash(clientToken,serverToken,passwd,(err,hash) => {
  console.log(hash.toString("hex"));
});
console.log(expectedPasswordHash.toString("hex"))