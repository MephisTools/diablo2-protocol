const ServerD2gs = require('./serverD2gs')

// Connect to battlenet
function createServerD2gs (host, externalHost) {
  const portD2gs = 4000
  const serverD2gs = new ServerD2gs()
  serverD2gs.listen(host, portD2gs)
  serverD2gs.on('connection', clientD2gs => {
    console.log('new client d2gs', clientD2gs.socket.address())

    clientD2gs.write('D2GS_NEGOTIATECOMPRESSION', {
      compressionMode: 0
    })

    clientD2gs.on('D2GS_GAMELOGON', () => {
      clientD2gs.write('D2GS_LOGONRESPONSE', {
        unknown: 0
      })
    })

    clientD2gs.on('D2GS_PING', ({ tickCount, delay, wardenResponse }) => {
      clientD2gs.write('D2GS_PONG', {
        tickCount: new Array(32).fill(0)
      })
    })
  })
  return serverD2gs
}

module.exports = createServerD2gs
