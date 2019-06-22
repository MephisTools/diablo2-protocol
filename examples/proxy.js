const { createClientDiablo, ServerDiablo, createServerSid, createServerMcp, ServerD2gs } = require('..')
const { supportedVersions, defaultVersion } = require('..')

if (process.argv.length !== 11) {
  console.log('Usage : node bot.js <username> <password> <character> <gamename> <gamepasswd> <gameserver> <externalHost> <sidServer> <version>')
  process.exit(1)
}

const username = process.argv[2]
const password = process.argv[3]
const character = process.argv[4]
const gameName = process.argv[5]
const gamePassword = ''
const gameServer = process.argv[7]
const externalHost = process.argv[8]
const sidServer = process.argv[9]

// If the version correspond to a supported version else use default
const version = supportedVersions.find(v => v === process.argv[9]) ? process.argv[9] : defaultVersion

const host = '127.0.0.1'

const serverDiablo = new ServerDiablo(version)

const serverSid = createServerSid(host, externalHost, version)

serverDiablo.setServerSid(serverSid)

const serverMcp = createServerMcp(host, externalHost, version)

serverDiablo.setServerMcp(serverMcp)

// Connect to battlenet
function createServerD2gs (host, version) {
  const portD2gs = 4000
  const serverD2gs = new ServerD2gs(version)
  serverD2gs.listen(host, portD2gs)
  serverD2gs.on('connection', async clientD2gsServer => {
    console.log('new client d2gs', clientD2gsServer.socket.address())

    const clientDiablo = await createClientDiablo({
      host: sidServer,
      username,
      password,
      version: version
    })

    let posX = 0
    let posY = 0
    clientDiablo.on('clientD2gsReady', clientD2gsClient => {
      clientD2gsClient.socket.on('data', data => clientD2gsServer.socket.write(data))
    })

    clientDiablo.on('D2GS_REASSIGNPLAYER', ({ x, y }) => {
      posX = x
      posY = y
    })
    clientDiablo.on('D2GS_GAMECHAT', ({ charName, message }) => {
      if (message === '.tp') {
        clientDiablo.write('D2GS_RIGHTSKILLONLOCATION', {
          x: posX,
          y: posY
        })
      }
    })

    await clientDiablo.selectCharacter(character)
    await clientDiablo.createGame(gameName, gamePassword, gameServer, 0)

    clientD2gsServer.socket.on('data', data => clientDiablo.clientD2gs.socket.write(data))
    console.log('Has joined the game')
  })
  return serverD2gs
}

const serverD2gs = createServerD2gs(host, version)

serverDiablo.setServerD2gs(serverD2gs)

serverDiablo.on('connection', client => {
})
