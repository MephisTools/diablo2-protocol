const ClientMcp = require('./clientMcp')
const { once } = require('once-promise')
const diabloData = require('diablo2-data')('pod_1.13d')

// Connect to account
async function createClientMcp (clientDiablo, hostMcp, portMcp, MCPCookie, MCPStatus, MCPChunk1, MCPChunk2, battleNetUniqueName, version) {
  const clientMcp = new ClientMcp(version)
  clientDiablo.setClientMcp(clientMcp)
  clientMcp.on('connect', () => {
    clientDiablo.emit('log', 'connected to MCP server')
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
    if (result === 0) {
      clientDiablo.write('MCP_CHARLIST2', {
        numberOfCharacterToList: 8
      })
      clientDiablo.emit('log', diabloData.responses.startup[result])
    } else {
      clientDiablo.emit('error', new Error(diabloData.responses.startup[result]))
    }
  })

  const p = once(clientDiablo, 'MCP_CHARLIST2')
  clientMcp.connect(hostMcp, portMcp)

  const { characters } = await p
  clientDiablo.emit('charactersList', characters)
  return { clientDiablo, characters }
}

module.exports = createClientMcp
