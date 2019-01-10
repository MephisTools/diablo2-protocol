const ServerD2gs = require('./serverD2gs')

// Connect to battlenet
async function createServerD2gs (host) {
  const portD2gs = 6112
  const serverD2gs = new ServerD2gs()
  serverD2gs.listen(host, portD2gs)
  serverD2gs.on('connection', clientD2gs => {
    clientD2gs.on('packet', (packet) => console.log(packet))
  })
}

createServerD2gs('127.0.0.1')

module.exports = createServerD2gs
