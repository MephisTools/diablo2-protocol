const ServerMcp = require('./serverMcp')

async function createServerMcp (host) {
  const portSid = 6113
  const serverSid = new ServerMcp()
  serverSid.listen(host, portSid)
  serverSid.on('connection', clientSid => {
    clientSid.on('packet', (packet) => console.log(packet))
  })
}

createServerMcp('127.0.0.1')

module.exports = createServerMcp
