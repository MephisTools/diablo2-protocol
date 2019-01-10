const ServerD2gs = require('./serverD2gs')

// Connect to battlenet
function createServerD2gs (host) {
  const portD2gs = 6112
  const serverD2gs = new ServerD2gs()
  serverD2gs.listen(host, portD2gs)
  serverD2gs.on('connection', clientD2gs => {
    clientD2gs.on('packet', (packet) => console.log(packet))
  })
  return serverD2gs
}

module.exports = createServerD2gs
