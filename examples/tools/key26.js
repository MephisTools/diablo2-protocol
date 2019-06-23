const { cdKey26 } = require('../..')

const key1 = cdKey26('AGBDETY7UJQADERTB78PQAFH9O', 5475675675, 4564564544)
const key2 = cdKey26('AGBDETY7UJQEGERTB78PQAFH9O', 5475675675, 4564564544)

console.log(JSON.stringify(key1))
console.log(key1)

console.log(JSON.stringify(key2))
