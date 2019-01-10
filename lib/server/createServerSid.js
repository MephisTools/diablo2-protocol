const ServerSid = require('./serverSid')

// Connect to battlenet
function createServerSid (host) {
  const portSid = 6112
  const serverSid = new ServerSid()
  serverSid.listen(host, portSid)
  serverSid.on('connection', clientSid => {
    clientSid.on('packet', (packet) => console.log(packet))
  })
  return serverSid
}

module.exports = createServerSid
