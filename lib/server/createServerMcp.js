const ServerMcp = require('./serverMcp')

function createServerMcp (host) {
  const portMcp = 6113
  const serverMcp = new ServerMcp()
  serverMcp.listen(host, portMcp)
  serverMcp.on('connection', clientMcp => {
    clientMcp.on('MCP_STARTUP', () => {
      clientMcp.write('MCP_STARTUP', {
        result: 0
      })
    })
  })
  return serverMcp
}

module.exports = createServerMcp
