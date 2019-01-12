const { createClientDiablo, ServerDiablo, createServerSid, createServerMcp, ServerD2gs } = require('..')

if (process.argv.length !== 9) {
  console.log('Usage : node bot.js <username> <password> <character> <gamename> <gamepasswd> <gameserver> <externalHost>')
  process.exit(1)
}

const username = process.argv[2]
const password = process.argv[3]
const character = process.argv[4]
const gameName = process.argv[5]
const gamePassword = ''
const gameServer = process.argv[7]
const externalHost = process.argv[8]

const host = '127.0.0.1'

const serverDiablo = new ServerDiablo()

const serverSid = createServerSid(host, externalHost)

serverDiablo.setServerSid(serverSid)

const serverMcp = createServerMcp(host, externalHost)

serverDiablo.setServerMcp(serverMcp)

// Connect to battlenet
function createServerD2gs (host) {
  const portD2gs = 4000
  const serverD2gs = new ServerD2gs()
  serverD2gs.listen(host, portD2gs)
  serverD2gs.on('connection', async clientD2gsServer => {
    console.log('new client d2gs', clientD2gsServer.socket.address())

    const clientDiablo = await createClientDiablo({
      host: '198.98.54.85',
      username,
      password
    })
    clientDiablo.on('clientD2gsReady', clientD2gsClient => {
      clientD2gsClient.socket.on('data', data => clientD2gsServer.socket.write(data))
    })


    clientDiablo.on('D2GS_GAMECHAT', ({ charName, message }) => {
      if (message === '.tp') {
        clientDiablo.write('D2GS_WAYPOINT', {
          waypointId: 86,
          unknown: 0,
          levelNumber: 129
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

const serverD2gs = createServerD2gs(host)

serverDiablo.setServerD2gs(serverD2gs)

serverDiablo.on('connection', client => {
})
