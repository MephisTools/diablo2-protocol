const ServerD2gs = require('./serverD2gs')

// Connect to battlenet
function createServerD2gs (host, externalHost) {
  const portD2gs = 4000
  const serverD2gs = new ServerD2gs()
  serverD2gs.listen(host, portD2gs)
  serverD2gs.on('connection', clientD2gs => {
    console.log('new client d2gs', clientD2gs.socket.address())
    clientD2gs.on('packet', (packet) => console.log(packet))
  })
  return serverD2gs
}

module.exports = createServerD2gs
