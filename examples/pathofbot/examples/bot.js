const { createBot } = require('../index')

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

const character = process.argv[4]
const gameName = process.argv[5] === 'rand' ? randomGame : process.argv[5]
const gamePassword = process.argv[6] === 'none' ? '' : process.argv[6]
const gameServer = process.argv[7]

async function start () {
  const bot = await createBot({
    host: '198.98.54.85',
    username: process.argv[2],
    password: process.argv[3]
  })
  await bot.selectCharacter(character)
  await bot.createGame(gameName, gamePassword, gameServer, 0)
}

start()
