const { createClientDiablo } = require('..')

if (process.argv.length !== 9) {
  console.log('Usage : node bot.js <username> <password> <character> <gamename> <gamepasswd> <gameserver> <sidserver>')
  process.exit(1)
}

const character = process.argv[4]
const gameName = process.argv[5]
const gamePassword = process.argv[6]
const gameServer = process.argv[7]
const sidserver = process.argv[8]

async function start () {
  const clientDiablo = createClientDiablo({
    host: sidserver,
    username: process.argv[2],
    password: process.argv[3]
  })
  clientDiablo.on('D2GS_PLAYERMOVE', ({ targetX, targetY }) => {
    clientDiablo.write('D2GS_RUNTOLOCATION', {
      x: targetX,
      y: targetY
    })
  })

  await clientDiablo.connect()
  await clientDiablo.selectCharacter(character)
  await clientDiablo.createGame(gameName, gamePassword, gameServer, 0)
  console.log('Has joined the game')
}

start()
