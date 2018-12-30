const ClientSid = require('./clientSid')

const fs = require('fs')

const getHash = require('./getHash')

const getMpq = require('./getMpq')

const ClientMcp = require('./clientMcp')

const ClientD2gs = require('./clientD2gs')

const path = require('path')

function createClient ({ username, password, host, port, character, gameName, gamePassword, gameServer }) {
  const clientSid = new ClientSid({ host, port })
  const key1 = fs.readFileSync(path.resolve(__dirname, 'key1'))
  const key2 = fs.readFileSync(path.resolve(__dirname, 'key2'))
  clientSid.clientToken = 18226750
  clientSid.username = username
  clientSid.password = password
  clientSid.character = character
  clientSid.gameName = gameName
  clientSid.gamePassword = gamePassword
  clientSid.gameServer = gameServer

  clientSid.on('connect', () => {
    // 'connect' listener
    console.log('connected to server!')
    // client.write('world!\r\n');

    clientSid.socket.write(Buffer.from('01', 'hex')) // Initialises a normal logon conversation

    clientSid.platformId = 1230518326
    clientSid.productId = 1144150096

    clientSid.write('SID_AUTH_INFO', {
      protocolId: 0,
      platformCode: clientSid.platformId,
      productCode: clientSid.productId,
      versionByte: 14,
      languageCode: 1701729619,
      localIp: 587311296,
      timeZoneBias: 4294967236,
      mpqLocaleId: 1036,
      userLanguageId: 1033,
      countryAbreviation: 'FRA',
      country: 'France'
    }) // http://www.bnetdocs.org/?op=packet&pid=279 SID_AUTH_INFO
  })

  clientSid.on('SID_PING', ({ pingValue }) => {
    console.log('I received a ping of ping', pingValue)
    clientSid.write('SID_PING', {
      pingValue
    })
  })

  function writeAuthCheck () {
    clientSid.write('SID_AUTH_CHECK', {
      'clientToken': clientSid.clientToken,
      'exeVersion': 16780544,
      'exeHash': 1666909528,
      'numberOfCDKeys': 2,
      'spawnKey': 0,
      'cdKeys': [
        {
          'keyLength': 26,
          'keyProductValue': 24,
          'keyPublicValue': 10916470,
          'unknown': 0,
          'hashedKeyData': key1
        },
        {
          'keyLength': 26,
          'keyProductValue': 25,
          'keyPublicValue': 6187878,
          'unknown': 0,
          'hashedKeyData': key2
        }
      ],
      'exeInformation': 'Game.exe 10/18/11 20:48:14 65536',
      'keyOwnerName': 'sonlight'
    })
  }

  clientSid.on('SID_AUTH_INFO', ({ logonType, serverToken, udpValue, mpqFiletime, mpqFilename, valuestring }) => {
    clientSid.serverToken = serverToken
    getMpq(host, port, mpqFiletime, mpqFilename, clientSid.platformId, clientSid.productId, writeAuthCheck)
  })

  clientSid.on('SID_AUTH_CHECK', ({ result, additionalInformation }) => {
    if (result === 0) {
      console.log('Correct keys')
      clientSid.write('SID_GETFILETIME', {
        requestId: 2147483652,
        unknown: 0,
        filename: 'bnserver-D2DV.ini'
      })
    }
  })

  clientSid.on('SID_GETFILETIME', () => {
    clientSid.write('SID_LOGONRESPONSE2', {
      clientToken: clientSid.clientToken,
      serverToken: clientSid.serverToken,
      passwordHash: getHash(clientSid.clientToken, clientSid.serverToken, clientSid.password),
      username: clientSid.username
    })
  })

  clientSid.on('SID_LOGONRESPONSE2', ({ status }) => {
    console.log(status === 0 ? 'Success' : status === 1 ? "Account doesn't exist" : status === 2 ? 'Invalid password' : 'Account closed')
    if (status === 0) {
      clientSid.write('SID_QUERYREALMS2', {})
    }
  })

  clientSid.on('SID_QUERYREALMS2', ({ realms }) => {
    clientSid.write('SID_LOGONREALMEX', {
      clientToken: clientSid.clientToken,
      hashedRealmPassword: getHash(clientSid.clientToken, clientSid.serverToken, clientSid.password),
      realmTitle: realms[0].realmTitle
    })
  })

  clientSid.on('SID_LOGONREALMEX', ({ MCPCookie, MCPStatus, MCPChunk1, IP, port, MCPChunk2, battleNetUniqueName }) => {
    clientSid.MCPCookie = MCPCookie
    host = IP[0] + '.' + IP[1] + '.' + IP[2] + '.' + IP[3]
    const clientMcp = new ClientMcp({ host, port })

    clientMcp.on('connect', () => {
      // 'connect' listener
      console.log('connected to MCP server!')

      clientMcp.socket.write(Buffer.from('01', 'hex')) // This Initialise conversation

      clientMcp.write('MCP_STARTUP', {
        MCPCookie: MCPCookie,
        MCPStatus: MCPStatus,
        MCPChunk1: MCPChunk1,
        MCPChunk2: MCPChunk2,
        battleNetUniqueName: battleNetUniqueName
      })
    })

    clientMcp.on('MCP_STARTUP', ({ result }) => {
      if (result === 0x02 || (result >= 0x0A && result <= 0x0D)) {
        console.log('Realm Unavailable: No Battle.net connection detected.')
      } else if (result === 0x7E) {
        console.log('CDKey banned from realm play.')
      } else if (result === 0x7F) {
        console.log('Temporary IP ban "Your connection has been temporarily restricted from this realm. Please try to log in at another time."')
      } else {
        console.log('Success!')
        clientMcp.write('MCP_CHARLIST2', {
          numberOfCharacterToList: 8
        })
      }
    })

    clientMcp.on('MCP_CHARLIST2', ({ numbersOfCharactersRequested, numbersOfCharactersInAccount, characters }) => {
      console.log(numbersOfCharactersRequested, numbersOfCharactersInAccount, characters)
      clientSid.write('SID_GETCHANNELLIST', {
        productId: 0
        // In the past this packet returned a product list for the specified Product ID,
        // however, the Product ID field is now ignored -- it does not need to be a valid Product ID,
        // and can be set to zero. The list of channels returned will be for the client's product,
        // as specified during the client's logon.
      })
      clientSid.write('SID_ENTERCHAT', {
        characterName: clientSid.character,
        realm: 'Path of Diablo' // TODO: dynamic realm ?
      })
    })

    clientSid.on('SID_GETCHANNELLIST', (data) => {
      console.log(data)
    })

    clientSid.on('SID_CHATEVENT', (data) => {
      console.log(data)
      console.log('Text : ' + String.fromCharCode(data.text))
    })

    clientSid.on('SID_ENTERCHAT', (data) => {
      console.log(data)
      /*
      clientMcp.write('SID_NEWS_INFO', {
        newsTimestamp:0
      });
      */ // "disconnected from mcp server" when using this packet
      /*
    clientMcp.write('SID_CHECKAD', { // useless ?
        platformId: client.platformId,
        productId: client.productId,
        IDOfLastDisplayedBanned: 0,
        currentTime:0
    });

    // server -> client NEWS_INFO, useless ?
    // server -> client SID_CHECKAD
    // client -> server SID_DISPLAYAD
    */

      clientMcp.write('MCP_CHARLOGON', {
        characterName: clientSid.character
      })
    })

    clientMcp.on('MCP_CHARLOGON', (data) => {
      console.log(data)
      clientMcp.write('MCP_MOTD', {
        characterName: clientSid.character
      })
    })

    clientMcp.on('MCP_CHARLOGON', ({ MOTD }) => {
      console.log(MOTD)

      clientMcp.write('MCP_CREATEGAME', {
        requestId: 2,
        difficulty: 0, // NORMAL, TODO : set diff with args
        unknown: 1,
        levelRestrictionDifference: 99,
        maximumPlayers: 8,
        gameName: clientSid.gameName,
        gamePassword: clientSid.gamePassword,
        gameDescription: 'gs ' + clientSid.gameServer
      })
    })

    clientMcp.on('MCP_CREATEGAME', ({ requestId, gameToken, unknown, result }) => {
      console.log(requestId, gameToken, unknown, result)
      clientMcp.write('MCP_JOINGAME', {
        requestId: requestId,
        gameName: clientSid.gameName,
        gamePassword: clientSid.gamePassword
      })
    })

    clientMcp.on('MCP_JOINGAME', ({ requestId, gameToken, unknown, IPOfD2GSServer: IP2, gameHash, result }) => {
      clientSid.gameToken = gameToken
      clientSid.gameHash = gameHash
      clientSid.write('SID_STARTADVEX3', {
        gameStats: 1, // private game, TODO: dynamic
        gameUptimeInSeconds: 0,
        gameType: 0,
        subGameType: 0,
        providerVersionConstant: 0,
        ladderType: 0, // Ladder game, no point in playing non-ladder
        gameName: clientSid.gameName,
        gamePassword: clientSid.gamePassword,
        gameStatstring: ''
      })

      clientSid.IP2 = IP2
    })
    // TODO : put all login packets into a function (module programming)

    clientSid.on('SID_STARTADVEX3', (data) => {
      console.log(data)
      clientSid.write('SID_NOTIFYJOIN', {
        productId: 1, // random
        productVersion: 14,
        gameName: clientSid.gameName,
        gamePassword: clientSid.gamePassword
      })

      clientSid.write('SID_LEAVECHAT', {})

      createD2gs()
    })

    function createD2gs () {
      const IP2 = clientSid.IP2

      const clientD2gs = new ClientD2gs({ host: IP2[0] + '.' + IP2[1] + '.' + IP2[2] + '.' + IP2[3], port: 4000 })

      clientD2gs.initialTime = Date.now()
      clientD2gs.connect()

      clientD2gs.on('connect', () => {
        console.log('connected to clientD2gs')
      })

      clientD2gs.on('D2GS_NEGOTIATECOMPRESSION', (data) => {
        const asciiCharName = []
        clientSid.character.split('').forEach(ascii => { asciiCharName.push(ascii.charCodeAt()) })
        if (asciiCharName.length < 16) {
          for (let i = 0; i < 16 - clientSid.character.length; i++) { asciiCharName.push(0) }
        } // # Got to fill with 0 to reach length 16

        clientD2gs.write('D2GS_GAMELOGON', {
          MCPCookie: clientSid.gameHash,
          gameId: clientSid.gameToken,
          characterClass: 1,
          gameVersion: 14,
          gameConstant: [ 1355570669, 3055134097 ], // from https://bnetdocs.org/packet/131/d2gs-gamelogon
          locale: 0,
          characterName: asciiCharName
        })
      })

      clientD2gs.on('D2GS_LOGONRESPONSE', (data) => {
        clientD2gs.write('D2GS_ENTERGAMEENVIRONMENT', {})
        clientD2gs.enableCompression()

        setTimeout(() => {
          clientD2gs.write('D2GS_WALKTOLOCATION', {
            xCoordinate: 5348,
            yCoordinate: 4257
          })
        }, 10000)
      })

      setInterval(() => {
        clientD2gs.write('D2GS_PING', {
          tickCount: Date.now() - clientD2gs.initialTime,
          delay: clientD2gs.latency,
          wardenResponse: 0
        })
        clientD2gs.timeAtLastPing = Date.now()
      }, 5000)

      clientD2gs.on('D2GS_PONG', () => {
        clientD2gs.latency = Date.now() - clientD2gs.timeAtLastPing
        console.log('latency is ' + clientD2gs.latency + 'ms')
      })
    }

    clientMcp.connect()
  })

  clientSid.connect()

  return clientSid
}

module.exports = createClient
