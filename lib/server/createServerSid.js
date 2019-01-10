const ServerSid = require('./serverSid')

// Connect to battlenet
async function createServerSid (host) {
  const portSid = 6112
  const serverSid = new ServerSid()
  serverSid.listen(host, portSid)
  serverSid.on('connection', clientSid => {
    clientSid.on('packet', (packet) => console.log(packet))
  })
}

createServerSid('127.0.0.1')

module.exports = createServerSid
