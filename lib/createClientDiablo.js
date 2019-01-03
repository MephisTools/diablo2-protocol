const ClientDiablo = require('./clientDiablo')

const createClientSid = require('./createClientSid')

const createClientMcp = require('./createClientMcp')

const createClientD2gs = require('./createClientD2gs')

const { once } = require('once-promise')

function toCamelCase (s) { return s.split(' ').map(w => w[0].toUpperCase() + w.substr(1).toLowerCase()).join(' ') }

async function createClientDiablo ({ username, password, host }) {
  const clientDiablo = new ClientDiablo()
  clientDiablo.username = username
  clientDiablo.password = password
  clientDiablo.gameRequestId = 2
  const { hostMcp, portMcp, MCPCookie, MCPStatus, MCPChunk1, MCPChunk2, battleNetUniqueName } = await createClientSid(clientDiablo, host)
  await createClientMcp(clientDiablo, hostMcp, portMcp, MCPCookie, MCPStatus, MCPChunk1, MCPChunk2, battleNetUniqueName)

  clientDiablo.selectCharacter = async (character) => {
    clientDiablo.character = character
    clientDiablo.write('SID_GETCHANNELLIST', {
      productId: 0
      // In the past this packet returned a product list for the specified Product ID,
      // however, the Product ID field is now ignored -- it does not need to be a valid Product ID,
      // and can be set to zero. The list of channels returned will be for the client's product,
      // as specified during the client's logon.
    })
    clientDiablo.write('SID_ENTERCHAT', {
      characterName: character,
      realm: 'Path of Diablo' // TODO: dynamic realm ?
    })
    clientDiablo.on('SID_ENTERCHAT', (data) => {
      clientDiablo.write('MCP_CHARLOGON', {
        characterName: character
      })
    })

    await once(clientDiablo, 'MCP_CHARLOGON')
    clientDiablo.write('MCP_MOTD', {
      characterName: character
    })
  }

  // Create game = join game
  clientDiablo.createGame = async (gameName, gamePassword, gameServer, difficulty = 0) => {
    gameName = toCamelCase(gameName)
    clientDiablo.write('MCP_CREATEGAME', {
      requestId: clientDiablo.gameRequestId,
      difficulty, // NORMAL, TODO : set diff with args
      unknown: 1,
      levelRestrictionDifference: 99,
      maximumPlayers: 8,
      gameName: gameName,
      gamePassword: gamePassword,
      gameDescription: 'gs ' + gameServer
    })
    clientDiablo.gameRequestId += 2
    await new Promise(resolve => {
      clientDiablo.on('MCP_CREATEGAME', ({ requestId, gameToken, unknown, result }) => {
        clientDiablo.joinGame(requestId, gameName, gamePassword).then(resolve)
      })
    })
  }

  clientDiablo.joinGame = async (requestId, gameName, gamePassword) => {
    clientDiablo.write('MCP_JOINGAME', {
      requestId: requestId + 1,
      gameName: gameName,
      gamePassword: gamePassword
    })

    clientDiablo.on('MCP_JOINGAME', ({ gameToken, IPOfD2GSServer: IP2, gameHash }) => {
      clientDiablo.gameToken = gameToken
      clientDiablo.gameHash = gameHash
      clientDiablo.write('SID_STARTADVEX3', {
        gameStats: 1, // private game, TODO: dynamic
        gameUptimeInSeconds: 0,
        gameType: 0,
        subGameType: 0,
        providerVersionConstant: 0,
        ladderType: 0, // Ladder game, no point in playing non-ladder
        gameName: gameName,
        gamePassword: gamePassword,
        gameStatstring: ''
      })
      clientDiablo.IP2 = IP2
    })

    await once(clientDiablo, 'SID_STARTADVEX3')
    clientDiablo.write('SID_NOTIFYJOIN', {
      productId: 1, // random
      productVersion: 13,
      gameName: gameName,
      gamePassword: gamePassword
    })
    clientDiablo.write('SID_LEAVECHAT', {})
    await createClientD2gs(clientDiablo)
  }

  return clientDiablo
}

module.exports = createClientDiablo
