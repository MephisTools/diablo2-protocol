const ServerMcp = require('./serverMcp')

function createServerMcp (host) {
  const portMcp = 6113
  const serverMcp = new ServerMcp()
  serverMcp.listen(host, portMcp)
  serverMcp.on('connection', clientMcp => {
    clientMcp.on('packet', (packet) => console.log(packet))
  })
  return serverMcp
}

createServerMcp('127.0.0.1')

module.exports = createServerMcp
