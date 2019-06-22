const { createClientDiablo } = require('..')
const { supportedVersions, defaultVersion } = require('..')

if (process.argv.length !== 10) {
  console.log('Usage : node bot.js <username> <password> <character> <gamename> <gamepasswd> <gameserver> <sidserver> <version>')
  process.exit(1)
}

const character = process.argv[4]
const gameName = process.argv[5]
const gamePassword = process.argv[6]
const gameServer = process.argv[7]
const sidserver = process.argv[8]

// If the version correspond to a supported version else use default
const version = supportedVersions.find(v => v === process.argv[9]) ? process.argv[9] : defaultVersion

async function start () {
  const clientDiablo = createClientDiablo({
    host: sidserver,
    username: process.argv[2],
    password: process.argv[3],
    version: version
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
