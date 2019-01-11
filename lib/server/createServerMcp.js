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

    clientMcp.on('MCP_CHARLIST2', ({ numberOfCharacterToList }) => {
      clientMcp.write('MCP_CHARLIST2', {
        numbersOfCharactersRequested: numberOfCharacterToList,
        numbersOfCharactersInAccount: 100,
        characters: [
          {
            expirationDate: Date.parse('22 December 2022') / 1000,
            characterName: 'lol',
            characterStatstring: ''
          }
        ]
      })
    })

    clientMcp.on('MCP_CHARLOGON', ({ characterName }) => {
      clientMcp.write('MCP_CHARLOGON', {
        result: 0
      })
    })
  })
  return serverMcp
}

module.exports = createServerMcp
