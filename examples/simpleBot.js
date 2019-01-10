const { createClientDiablo } = require('..')

if (process.argv.length !== 8) {
  console.log('Usage : node bot.js <username> <password> <character> <gamename> <gamepasswd> <gameserver>')
  process.exit(1)
}

const character = process.argv[4]
const gameName = process.argv[5]
const gamePassword = ''
const gameServer = process.argv[7]

async function start () {
  const clientDiablo = await createClientDiablo({
    host: '198.98.54.85',
    username: process.argv[2],
    password: process.argv[3]
  })
  clientDiablo.on('D2GS_PLAYERMOVE', ({ targetX, targetY }) => {
    clientDiablo.write('D2GS_RUNTOLOCATION', {
      xCoordinate: targetX,
      yCoordinate: targetY
    })
  })

  await clientDiablo.selectCharacter(character)
  await clientDiablo.createGame(gameName, gamePassword, gameServer, 0)
  console.log('Has joined the game')
}

start()
