const ServerSid = require('./serverSid')

/*const getHash = require('./getHash')

const getMpq = require('./getMpq')

const fs = require('fs')

const path = require('path')

const { once } = require('once-promise')*/

// Connect to battlenet
async function createServerSid (serverDiablo, host) {
  const portSid = 6112
  const serverSid = new ServerSid({ host, port: portSid })
  serverSid.createServer()
  //serverDiablo.setClientSid(serverSid)
  serverSid.on('createServer', () => {
    console.log('server opened!')
  })

  serverSid.socket.on('data', ({ data }) => {
    console.log('yolo')
    /*if (data.toString('hex') === '01') { // Initialises a normal logon conversation
      console.log('yolo')
    }*/
  })

  /*
  serverDiablo.on('SID_AUTH_INFO', ({ data }) => {
    serverDiablo.write('SID_PING', {
      pingvalue: 123456789 // TODO: random ???
    })
  })

  serverDiablo.on('SID_PING', ({ pingValue }) => {
    console.log('I received a ping of ping', pingValue)
    serverDiablo.write('SID_PING', {
      pingValue // TODO: random ???
    })
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
  */
}

createServerSid(undefined, '127.0.0.1')

module.exports = createServerSid
