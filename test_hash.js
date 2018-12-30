const getHash = require('./getHash')

const clientToken = 18226750
const serverToken = 1515471831
const passwd = 'bzkl12'

const expectedPasswordHash = Buffer.from([
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
])

console.log(getHash(clientToken, serverToken, passwd).toString('hex'))
console.log(expectedPasswordHash.toString('hex'))
