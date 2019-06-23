const ClientSid = require('./clientSid')

const getHash = require('../utils/getHash')

const { once } = require('once-promise')

// const cdkey16 = require('../utils/cdkey')
const cdkey = require('../utils/cdkey26')
const checkRevision = require('../utils/checkRevision')

// Connect to battlenet
async function createClientSid (clientDiablo, host, version) {
  // const getMpq = require(`../utils/getMpq1.13`)
  const portSid = 6112
  const clientSid = new ClientSid(version)
  clientDiablo.setClientSid(clientSid)
  clientDiablo.clientToken = 2045114178
  clientSid.on('connect', () => {
    // 'connect' listener
    console.log('connected to server!')

    clientSid.socket.write(Buffer.from('01', 'hex')) // Initialises a normal logon conversation

    clientDiablo.platformId = 1230518326
    clientDiablo.productId = 1144150096

    clientDiablo.write('SID_AUTH_INFO', {
      protocolId: 0,
      platformCode: clientDiablo.platformId,
      productCode: clientDiablo.productId,
      versionByte: 14,
      languageCode: 1718765138,
      localIp: 251789322,
      timeZoneBias: 4294967176,
      mpqLocaleId: 1033,
      userLanguageId: 1033,
      countryAbreviation: 'USA',
      country: 'United States'
    }) // http://www.bnetdocs.org/?op=packet&pid=279 SID_AUTH_INFO
  })

  clientDiablo.on('SID_PING', ({ pingValue }) => {
    console.log('I received a ping of ping', pingValue)
    clientDiablo.write('SID_PING', {
      pingValue
    })
  })

  clientDiablo.on('SID_AUTH_INFO', ({ logonType, serverToken, udpValue, mpqFiletime, mpqFilename, valuestring }) => {
    clientDiablo.serverToken = serverToken
    /* clientDiablo.setClientBnftp(getMpq({
      host,
      port: portSid,
      mpqFiletime,
      mpqFilename,
      platformId: clientDiablo.platformId,
      productId: clientDiablo.productId,
      clientToken: clientDiablo.clientToken,
      key: {
        keyLength: 26,
        keyProductValue: 25,
        keyPublicValue: 6187878,
        unknown: 0,
        hashedKeyData: Buffer.from([16, 21, 99, 70, 214, 92, 4, 34, 149, 121, 40, 75, 48, 99, 96, 154, 248, 99, 114, 226])
      }
    }, () => {})) */

    const key1 = cdkey(clientDiablo.keyClassic, clientDiablo.clientToken, clientDiablo.serverToken)
    const key2 = cdkey(clientDiablo.keyExtension, clientDiablo.clientToken, clientDiablo.serverToken)
    const { checksum, info } = checkRevision(valuestring)

    clientDiablo.write('SID_AUTH_CHECK', {
      'clientToken': clientDiablo.clientToken,
      'exeVersion': 0,
      'exeHash': checksum,
      'numberOfCDKeys': 2,
      'spawnKey': 0,
      'cdKeys': [
        { 'keyLength': 26,
          'keyProductValue': 24,
          'keyPublicValue': key1.publicValue.readUInt32LE(),
          'unknown': 0,
          'hashedKeyData': key1.output
        },
        { 'keyLength': 26,
          'keyProductValue': 25,
          'keyPublicValue': key2.publicValue.readUInt32LE(),
          'unknown': 0,
          'hashedKeyData': key2.output
        }],
      'exeInformation': info,
      'keyOwnerName': 'Louis'
    })
  })

  clientDiablo.on('SID_AUTH_CHECK', ({ result, additionalInformation }) => {
    if (result === 0) {
      console.log('Correct keys')
      clientDiablo.write('SID_GETFILETIME', {
        requestId: 2147483652,
        unknown: 0,
        filename: 'bnserver-D2DV.ini'
      })
    } else {
      console.log(`result is ${result}, wrong key`)
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

  clientSid.connect(host, portSid)

  const { MCPCookie, MCPStatus, MCPChunk1, IP, port, MCPChunk2, battleNetUniqueName } = await p

  clientDiablo.MCPCookie = MCPCookie
  const hostMcp = IP[0] + '.' + IP[1] + '.' + IP[2] + '.' + IP[3]
  return { hostMcp, portMcp: port, MCPCookie, MCPStatus, MCPChunk1, MCPChunk2, battleNetUniqueName }
}

module.exports = createClientSid
