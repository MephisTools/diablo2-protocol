const ClientD2gs = require('./clientD2gs')
const { once } = require('once-promise')
const { toNumVersion } = require('../../version')

async function createClientD2gs (clientDiablo, version) {
  const IP2 = clientDiablo.IP2
  clientDiablo.latency = 0
  const clientD2gs = new ClientD2gs(version)
  clientDiablo.setClientD2gs(clientD2gs)
  clientDiablo.initialTime = Date.now()
  clientD2gs.connect(IP2[0] + '.' + IP2[1] + '.' + IP2[2] + '.' + IP2[3], 4000)
  clientDiablo.emit('clientD2gsReady', clientD2gs)

  clientD2gs.on('connect', () => {
    console.log('connected to clientD2gs')
  })

  clientDiablo.on('D2GS_NEGOTIATECOMPRESSION', (data) => {
    const asciiCharName = []
    clientDiablo.character.split('').forEach(ascii => { asciiCharName.push(ascii.charCodeAt()) })
    if (asciiCharName.length < 16) {
      for (let i = 0; i < 16 - clientDiablo.character.length; i++) { asciiCharName.push(0) }
    } // # Got to fill with 0 to reach length 16

    clientDiablo.write('D2GS_GAMELOGON', {
      MCPCookie: clientDiablo.gameHash,
      gameId: clientDiablo.gameToken,
      characterClass: 1,
      gameVersion: toNumVersion(version),
      gameConstant: [ 2443516342, 3982347344 ],
      locale: 0,
      characterName: asciiCharName
    })
  })

  setInterval(() => {
    console.log(`Latency ${clientDiablo.lastPing - clientDiablo.lastPong}`)
    if (clientDiablo.lastPing - clientDiablo.lastPong > 10000) {
      console.log('Server stopped answering, probably crashed')
      process.exit(1)
    }
    clientDiablo.write('D2GS_PING', {
      tickCount: Date.now() - clientDiablo.initialTime,
      delay: clientDiablo.latency,
      wardenResponse: 0
    })
    clientDiablo.lastPing = Date.now()
  }, 5000)

  clientDiablo.on('D2GS_PONG', () => {
    clientDiablo.latency = Date.now() - clientDiablo.lastPing
    clientDiablo.lastPong = Date.now()
    // console.log('latency is ' + clientDiablo.latency + 'ms')
  })

  if (version === '1.13') await once(clientDiablo, 'D2GS_LOGONRESPONSE')
  else await once(clientDiablo, 'D2GS_GAMELOADING')
  clientDiablo.write('D2GS_ENTERGAMEENVIRONMENT', {})
  if (version === '1.13') {
    clientD2gs.socket.write(Buffer.from('2b0155332211', 'hex'))// 2b0155332211 // PoD anticheat
    clientD2gs.enableCompression(true)
  }
  clientDiablo.emit('gameJoined')
}

module.exports = createClientD2gs
