const ClientDiablo = require('./clientDiablo')
const createClientSid = require('./createClientSid')
const createClientMcp = require('./createClientMcp')
const createClientD2gs = require('./createClientD2gs')
const { once } = require('once-promise')
const { toNumVersion } = require('../../version')
const diabloData = require('diablo2-data')('pod_1.13d')

function toCamelCase (s) {
  if (s === '') { return '' }
  return s.split(' ').map(w => w[0].toUpperCase() + w.substr(1).toLowerCase()).join(' ')
}

function createClientDiablo ({ username, password, host, version, keyClassic, keyExtension, delayPackets }) {
  const clientDiablo = new ClientDiablo(version) // TODO: Either use constructor to pass param or do object.param = param but not both ?
  clientDiablo.username = username
  clientDiablo.password = password
  clientDiablo.gameRequestId = 2
  clientDiablo.keyClassic = keyClassic
  clientDiablo.keyExtension = keyExtension
  clientDiablo.delayPackets = delayPackets

  clientDiablo.connect = async () => {
    const { hostMcp, portMcp, MCPCookie, MCPStatus, MCPChunk1, MCPChunk2, battleNetUniqueName } = await createClientSid(clientDiablo, host, version)
    const result = await createClientMcp(clientDiablo, hostMcp, portMcp, MCPCookie, MCPStatus, MCPChunk1, MCPChunk2, battleNetUniqueName, version)
    console.log(`Got characters ${result.characters}`)
  }

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
  clientDiablo.createGame = async (gameName, gamePassword, gameServer, difficulty = 0, joinIfAlreadyExists = true) => {
    gameName = toCamelCase(gameName)
    gamePassword = toCamelCase(gamePassword)
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
    await new Promise((resolve, reject) => {
      clientDiablo.on('MCP_CREATEGAME', ({ requestId, gameToken, unknown, result }) => {
        if (result === 0x00) { // succeed
          clientDiablo.joinGame(requestId, gameName, gamePassword, true).then(resolve)
        } else if (result === 0x1E || result === 0x1F) { // already exists
          if (joinIfAlreadyExists) {
            clientDiablo.joinGame(requestId, gameName, gamePassword, false).then(resolve)
          } else {
            reject(new Error('Game already exists'))
          }
        } else if (result === 0x20) {
          reject(new Error('Game servers are down'))
        } else if (result === 0x6E) {
          reject(new Error('A dead hardcore character cannot create games'))
        } else {
          reject(new Error(`Create game failed for unknown reason : ${result}`))
        }
      })
    })
  }

  clientDiablo.joinGame = async (requestId, gameName, gamePassword, newGame = false) => {
    clientDiablo.write('MCP_JOINGAME', {
      requestId: requestId + 1,
      gameName: gameName,
      gamePassword: gamePassword
    })

    const { gameToken, IPOfD2GSServer: IP2, gameHash, result } = await once(clientDiablo, 'MCP_JOINGAME')

    if (result !== 0) {
      clientDiablo.emit('error', Error(`Cannot connect error ${result} : ${diabloData.responses.joinGame[result]}`))
    }

    clientDiablo.IP2 = IP2
    clientDiablo.gameToken = gameToken
    clientDiablo.gameHash = gameHash
    if (newGame && version === '1.13') {
      clientDiablo.write('SID_STARTADVEX3', {
        gameStats: 1, // private game, TODO: dynamic
        gameUptimeInSeconds: 0,
        gameType: 0,
        subGameType: 0,
        providerVersionConstant: 0,
        ladderType: 1, // Ladder game, no point in playing non-ladder
        gameName: gameName,
        gamePassword: gamePassword,
        gameStatstring: ''
      })

      const { status } = await once(clientDiablo, 'SID_STARTADVEX3')
      if (status === 1) {
        clientDiablo.emit('error', new Error('join failed'))
      }
    }

    clientDiablo.write('SID_NOTIFYJOIN', {
      productId: 1, // random
      productVersion: toNumVersion(version),
      gameName: gameName,
      gamePassword: gamePassword
    })
    clientDiablo.write('SID_LEAVECHAT', {})
    await createClientD2gs(clientDiablo, version)
  }

  return clientDiablo
}

module.exports = createClientDiablo
