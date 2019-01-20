const { createBot } = require('../index')

if (process.argv.length !== 6) {
  console.log('Usage : node bot.js <username> <password> <character> <gameserver>')
  process.exit(1)
}

const character = process.argv[4]
const gameServer = process.argv[5]

async function start () {
  const bot = await createBot({
    host: '198.98.54.85',
    username: process.argv[2],
    password: process.argv[3]
  })
  await bot.selectCharacter(character)
  bot.farmLoop(0, gameServer)
}

start()
