const ServerSid = require('./serverSid')
const { performance } = require('perf_hooks')

// Connect to battlenet
function createServerSid (host, externalHost, version) {
  const portSid = 6112
  const serverSid = new ServerSid(version)
  serverSid.listen(host, portSid)
  serverSid.on('connection', clientSid => {
    console.log('new client sid', clientSid.socket.address())
    clientSid.on('packet', (packet) => {
      console.log(packet)
    })
    clientSid.on('SID_AUTH_INFO', ({ data }) => {
      clientSid.write('SID_AUTH_INFO', {
        logonType: 0,
        serverToken: 981800484,
        udpValue: 486,
        mpqFiletime: [30698013, 3812817152],
        mpqFilename: 'IX86ver1.mpq',
        valuestring: 'A=3845581634 B=880823580 C=1363937103 4 A=A-S B=B-C C=C-A A=A-B'
      })
    })
    let t0 = 0
    const pingInterval = setInterval(() => {
      clientSid.write('SID_PING', { // TODO: check if client is still connected
        pingValue: 1111111
      })
      t0 = performance.now()
    }, 2000)
    clientSid.on('SID_PING', ({ value }) => {
      console.log('The client took', (performance.now() - t0).toFixed(2), 'ms to respond')
      if (performance.now() - t0 > 5000) {
        clientSid.socket.destroy()
      }
    })

    clientSid.on('SID_AUTH_CHECK', ({ clientToken }) => {
      clientSid.clientToken = clientToken
      clientSid.write('SID_AUTH_CHECK', {
        result: 0,
        additionalInformation: ''
      })
    })

    clientSid.on('SID_GETFILETIME', ({ requestId, unknown, filename }) => {
      clientSid.write('SID_GETFILETIME', {
        requestId: requestId,
        filename: filename,
        lastUpdateTime: [30698013, 3772817152]
      })
    })
    clientSid.on('SID_LOGONRESPONSE2', ({ clientToken, serverToken, passwordHash, username }) => {
      clientSid.username = username
      clientSid.write('SID_LOGONRESPONSE2', {
        status: 0
      })
    })

    clientSid.on('SID_QUERYREALMS2', () => {
      clientSid.write('SID_QUERYREALMS2', {
        unknown2: 0,
        realms: [{ 'unknown': 1, 'realmTitle': 'Path of Diablo', 'realmDescription': 'Bengal' }] // TODO: fix packet fields ?
      })
    })

    clientSid.on('SID_LOGONREALMEX', ({ clientToken, hashedRealmPassword, realmTitle }) => {
      clientSid.write('SID_LOGONREALMEX', {
        MCPCookie: 1,
        MCPStatus: 0,
        MCPChunk1: [0, 486],
        IP: externalHost.split('.').map(i => parseInt(i)),
        port: 6113,
        zero: 0,
        MCPChunk2: [981800484, 0, 0, 1144150096, 13, 0, 0, 281595104, 3297584608, 1061137625, 1147152351, 1500832563],
        battleNetUniqueName: clientSid.username
      })
    })

    clientSid.on('SID_GETCHANNELLIST', () => {
      clientSid.write('SID_GETCHANNELLIST', {
        channelNames: ['lol1', 'lol2']
      })
    })
    clientSid.on('SID_ENTERCHAT', ({ characterName, realm }) => {
      clientSid.write('SID_ENTERCHAT', {
        uniqueName: characterName,
        statstring: '',
        accountName: clientSid.username
      })
    })
    clientSid.on('SID_STARTADVEX3', () => {
      clientSid.write('SID_STARTADVEX3', {
        status: 0
      })
    })
    clearInterval(pingInterval)
  })
  return serverSid
}

module.exports = createServerSid
