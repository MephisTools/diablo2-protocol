const { cdKey } = require('../..')

const key1 = cdKey('ADEKI83RTGHUJKQA', 5475675675, 4564564544)
const key2 = cdKey('ADEKI83R75HUJKQA', 5475675675, 4564564544)

console.log(JSON.stringify(key1))
console.log(key1)

console.log(JSON.stringify(key2))
