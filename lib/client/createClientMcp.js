const ClientMcp = require('./clientMcp')

const { once } = require('once-promise')

// Connect to account
async function createClientMcp (clientDiablo, hostMcp, portMcp, MCPCookie, MCPStatus, MCPChunk1, MCPChunk2, battleNetUniqueName) {
  const clientMcp = new ClientMcp()
  clientDiablo.setClientMcp(clientMcp)
  clientMcp.on('connect', () => {
    // 'connect' listener
    console.log('connected to MCP server!')

    clientMcp.socket.write(Buffer.from('01', 'hex')) // This Initialise conversation

    clientDiablo.write('MCP_STARTUP', {
      MCPCookie: MCPCookie,
      MCPStatus: MCPStatus,
      MCPChunk1: MCPChunk1,
      MCPChunk2: MCPChunk2,
      battleNetUniqueName: battleNetUniqueName
    })
  })

  clientDiablo.on('MCP_STARTUP', ({ result }) => {
    if (result === 0x02 || (result >= 0x0A && result <= 0x0D)) {
      console.log('Realm Unavailable: No Battle.net connection detected.')
    } else if (result === 0x7E) {
      console.log('CDKey banned from realm play.')
    } else if (result === 0x7F) {
      console.log('Temporary IP ban "Your connection has been temporarily restricted from this realm. Please try to log in at another time."')
    } else {
      console.log('Success!')
      clientDiablo.write('MCP_CHARLIST2', {
        numberOfCharacterToList: 8
      })
    }
  })

  const p = once(clientDiablo, 'MCP_CHARLIST2')

  clientMcp.connect(hostMcp, portMcp)

  const { characters } = await p
  clientDiablo.emit('charactersList', characters)
  return { clientDiablo, characters }
}

module.exports = createClientMcp
