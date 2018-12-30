const createClient = require('../lib/createClient')

if (process.argv.length !== 8) {
  // Game servers list at https://pathofdiablo.com/p/
  // 21 france, 4 london ...
  console.log('Usage : node bot.js <username> <password> <character> <gamename> <gamepasswd> <gameserver>')
  process.exit(1)
}

const possible = 'abcdefghijklmnopqrstuvwxyz'
let randomGame = ''

for (let i = 0; i < 5; i++) { randomGame += possible.charAt(Math.floor(Math.random() * possible.length)) }

if (process.argv[5] === 'rand') { console.log('connecting to randomGame ' + randomGame) }

createClient({
  port: 6112,
  host: '198.98.54.85',
  username: process.argv[2],
  password: process.argv[3],
  character: process.argv[4],
  gameName: process.argv[5] === 'rand' ? randomGame : process.argv[5],
  gamePassword: '', // process.argv[6], // TODO add back when password is fixed
  gameServer: process.argv[7]
})
