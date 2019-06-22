const ClientD2gs = require('./clientD2gs')
const { once } = require('once-promise')

async function createClientD2gs (clientDiablo, version) {
  const IP2 = clientDiablo.IP2
  clientDiablo.latency = 500
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
      gameVersion: 13,
      gameConstant: [ 2443516342, 3982347344 ],
      locale: 0,
      characterName: asciiCharName
    })
  })

  setInterval(() => {
    clientDiablo.write('D2GS_PING', {
      tickCount: Date.now() - clientDiablo.initialTime,
      delay: clientDiablo.latency,
      wardenResponse: 0
    })
    clientDiablo.timeAtLastPing = Date.now()
  }, 5000)

  clientDiablo.on('D2GS_PONG', () => {
    clientDiablo.latency = Date.now() - clientDiablo.timeAtLastPing
    console.log('latency is ' + clientDiablo.latency + 'ms')
  })

  await once(clientDiablo, 'D2GS_LOGONRESPONSE')
  clientDiablo.write('D2GS_ENTERGAMEENVIRONMENT', {})
  clientD2gs.socket.write(Buffer.from('2b0155332211', 'hex')) // PoD anticheat packet XD
  clientD2gs.enableCompression()
  clientDiablo.emit('gameJoined')
  /*
  clientDiablo.write('D2GS_PING', {
    tickCount: Date.now() - clientDiablo.initialTime,
    delay: clientDiablo.latency,
    wardenResponse: 0
  })
  clientDiablo.timeAtLastPing = Date.now()
  */
}

module.exports = createClientD2gs
