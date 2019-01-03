const ClientSid = require('./clientSid')

const getHash = require('./getHash')

const getMpq = require('./getMpq')

const fs = require('fs')

const path = require('path')

const { once } = require('once-promise')

// Connect to battlenet
async function createClientSid (clientDiablo, host) {
  const portSid = 6112
  const clientSid = new ClientSid({ host, port: portSid })
  clientDiablo.setClientSid(clientSid)
  let key1, key2
  try {
    key1 = fs.readFileSync(path.resolve(__dirname, 'key1'))
    key2 = fs.readFileSync(path.resolve(__dirname, 'key2'))
  } catch (err) {
    key1 = Buffer.alloc(0)
    key2 = Buffer.alloc(0)
  }
  clientDiablo.clientToken = 18226750
  clientSid.on('connect', () => {
    // 'connect' listener
    console.log('connected to server!')
    // client.write('world!\r\n');

    clientSid.socket.write(Buffer.from('01', 'hex')) // Initialises a normal logon conversation

    clientDiablo.platformId = 1230518326
    clientDiablo.productId = 1144150096

    clientDiablo.write('SID_AUTH_INFO', {
      protocolId: 0,
      platformCode: clientDiablo.platformId,
      productCode: clientDiablo.productId,
      versionByte: 13,
      languageCode: 1701729619,
      localIp: 587311296,
      timeZoneBias: 4294967236,
      mpqLocaleId: 1036,
      userLanguageId: 1033,
      countryAbreviation: 'FRA',
      country: 'France'
    }) // http://www.bnetdocs.org/?op=packet&pid=279 SID_AUTH_INFO
  })

  clientDiablo.on('SID_PING', ({ pingValue }) => {
    console.log('I received a ping of ping', pingValue)
    clientDiablo.write('SID_PING', {
      pingValue
    })
  })

  function writeAuthCheck () {
    clientDiablo.write('SID_AUTH_CHECK', {
      'clientToken': clientDiablo.clientToken,
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

  clientDiablo.on('SID_AUTH_INFO', ({ logonType, serverToken, udpValue, mpqFiletime, mpqFilename, valuestring }) => {
    clientDiablo.serverToken = serverToken
    clientDiablo.setClientBnftp(getMpq(host, portSid, mpqFiletime, mpqFilename, clientDiablo.platformId, clientDiablo.productId, () => {}))
    writeAuthCheck()
  })

  clientDiablo.on('SID_AUTH_CHECK', ({ result, additionalInformation }) => {
    if (result === 0) {
      console.log('Correct keys')
      clientDiablo.write('SID_GETFILETIME', {
        requestId: 2147483652,
        unknown: 0,
        filename: 'bnserver-D2DV.ini'
      })
    }
  })

  clientDiablo.on('SID_GETFILETIME', () => {
    clientDiablo.write('SID_LOGONRESPONSE2', {
      clientToken: clientDiablo.clientToken,
      serverToken: clientDiablo.serverToken,
      passwordHash: getHash(clientDiablo.clientToken, clientDiablo.serverToken, clientDiablo.password),
      username: clientDiablo.username
    })
  })

  clientDiablo.on('SID_LOGONRESPONSE2', ({ status }) => {
    console.log(status === 0 ? 'Success' : status === 1 ? "Account doesn't exist" : status === 2 ? 'Invalid password' : 'Account closed')
    if (status === 0) {
      clientDiablo.write('SID_QUERYREALMS2', {})
    }
  })

  clientDiablo.on('SID_QUERYREALMS2', ({ realms }) => {
    clientDiablo.write('SID_LOGONREALMEX', {
      clientToken: clientDiablo.clientToken,
      hashedRealmPassword: getHash(clientDiablo.clientToken, clientDiablo.serverToken, clientDiablo.password),
      realmTitle: realms[0].realmTitle
    })
  })

  const p = once(clientDiablo, 'SID_LOGONREALMEX')

  clientSid.connect()

  const { MCPCookie, MCPStatus, MCPChunk1, IP, port, MCPChunk2, battleNetUniqueName } = await p

  clientDiablo.MCPCookie = MCPCookie
  const hostMcp = IP[0] + '.' + IP[1] + '.' + IP[2] + '.' + IP[3]
  return { hostMcp, portMcp: port, MCPCookie, MCPStatus, MCPChunk1, MCPChunk2, battleNetUniqueName }
}

module.exports = createClientSid
