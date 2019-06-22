const ServerMcp = require('./serverMcp')

function createServerMcp (host, externalHost, version) {
  const portMcp = 6113
  const serverMcp = new ServerMcp(version)
  serverMcp.listen(host, portMcp)
  serverMcp.on('connection', clientMcp => {
    console.log('new client sid', clientMcp.socket.address())
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

    clientMcp.on('MCP_CREATEGAME', ({ requestId }) => {
      clientMcp.write('MCP_CREATEGAME', {
        requestId,
        gameToken: 3,
        unknown: 4,
        result: 0
      })
    })

    clientMcp.on('MCP_JOINGAME', ({ requestId, gameName, gamePassword }) => {
      clientMcp.write('MCP_JOINGAME', {
        requestId,
        gameToken: 3,
        unknown: 4,
        IPOfD2GSServer: externalHost.split('.').map(i => parseInt(i)),
        gameHash: 5,
        result: 0
      })
    })
  })
  return serverMcp
}

module.exports = createServerMcp
