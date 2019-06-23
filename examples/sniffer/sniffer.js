const { supportedVersions, defaultVersion } = require('../..')

if (process.argv.length !== 4) {
  console.log('Usage : node sniffer.js <networkInterface> <version>')
  process.exit(1)
}

// If the version correspond to a supported version else use default
const version = supportedVersions.find(v => v === process.argv[3]) ? process.argv[3] : defaultVersion

/*
in a new chrome tab press f12 then do this :
const ws = new WebSocket('ws://localhost:8080')

ws.onmessage = (message) => console.log(message.data)
 */

const Parser = require('protodef').Parser
const networkInterface = process.argv[2]

const pcap = require('pcap')

const tcpTracker = new pcap.TCPTracker()

const WebSocket = require('ws')

const wss = new WebSocket.Server({ port: 8080 })

// Broadcast to all.
wss.broadcast = function broadcast (data) {
  wss.clients.forEach(function each (client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data)
    }
  })
}

const pcapSession = pcap.createSession(networkInterface, 'ip proto \\tcp')

pcapSession.on('packet', function (rawPacket) {
  const packet = pcap.decode.packet(rawPacket)
  tcpTracker.track_packet(packet)
})

const FullPacketParser = require('protodef').Parser
const ProtoDef = require('protodef').ProtoDef

const express = require('express')
const app = express()
// app.use(express.static(`${__dirname}/public`))

const {
  protocol,
  createSplitter,
  decompress,
  d2gsReader,
  itemParser,
  bitfieldLE
} = require('../..')

const mcpToServer = new ProtoDef(false)
mcpToServer.addProtocol(protocol[version].mcpProtocol, ['toServer'])

const mcpToClient = new ProtoDef(false)
mcpToClient.addProtocol(protocol[version].mcp, ['toClient'])

const sidToServer = new ProtoDef(false)
sidToServer.addProtocol(protocol[version].sid, ['toServer'])

const sidToClient = new ProtoDef(false)
sidToClient.addProtocol(protocol[version].sid, ['toClient'])

const bnftpToServer = new ProtoDef(false)
bnftpToServer.addProtocol(protocol[version].bnftp, ['toServer'])

const bnftpToClient = new ProtoDef(false)
bnftpToClient.addProtocol(protocol['1.13'].bnftp, ['toClient'])

const d2gsToClient = new ProtoDef(false)
d2gsToClient.addTypes(d2gsReader)
d2gsToClient.addTypes(bitfieldLE)
d2gsToClient.addProtocol(protocol['1.13'].d2gs, ['toClient'])

const d2gsToServer = new ProtoDef(false)
d2gsToServer.addProtocol(protocol[version].d2gs, ['toServer'])

const toClientParser = new FullPacketParser(d2gsToClient, 'packet')
const splitter = createSplitter()
splitter.sloppyMode = true
let messagesToClient = []
let messagesToServer = []

splitter.on('data', data => {
  const uncompressedData = decompress(data)

  toClientParser.write(uncompressedData)
})

toClientParser.on('data', ({ data, buffer }) => {
  try {
    let { name, params } = data

    if (name === 'D2GS_ITEMACTIONWORLD' || name === 'D2GS_ITEMACTIONOWNED') {
      params = itemParser(buffer)
    }
    wss.broadcast(JSON.stringify({ protocol: 'd2gsToClient', name, params }))
    console.info('d2gsToClient : ', name, JSON.stringify(params))
    console.log('raw', 'd2gsToClient', name, buffer)
    messagesToClient.push(`d2gsToClient : ${name} ${JSON.stringify(params)}`)
  } catch (err) {
    console.log(err)
    console.log('raw', 'd2gsToClient', buffer)
  }
})

let clientPortSid = null
let clientPortBnFtp = null
let compression = true

// server ports
const sidPort = '6112'
const d2gsPort = '4000'
const mcpPort = '6113'

const trackedPorts = new Set([sidPort, d2gsPort, mcpPort])

function displayD2gsToClient (data) {
  try {
    if (!compression) {
      if (data[0] !== 0xaf) { data = data.slice(1) }

      const parsed = d2gsToClient.parsePacketBuffer('packet', data).data

      const { name, params } = parsed
      wss.broadcast(JSON.stringify({ protocol: 'd2gsToClient', name, params }))
      console.info('d2gsToClient (uncompressed): ', name, JSON.stringify(params))
      if (name === 'D2GS_NEGOTIATECOMPRESSION' && params.compressionMode !== 0) {
        compression = true
      }
    } else {
      splitter.write(data)
    }
  } catch (error) {
    console.log('d2gsToClient : ', error.message)
    console.log('raw', 'd2gsToClient', data)
  }
}

function displayParsed (proto, protoName, data, raw = false) {
  try {
    const { name, params } = proto.parsePacketBuffer('packet', data).data
    console.log(protoName, ':', name, JSON.stringify(params))
    wss.broadcast(JSON.stringify({ protocol: protoName, name, params }))
    if (raw) console.log('raw', protoName, name, data.toString('hex'))
    messagesToServer.push(`${protoName}:${name} ${JSON.stringify(params)}`)
  } catch (error) {
    console.log(protoName, ':', error.message)
  }
}

function displayD2gsToServer (data) {
  displayParsed(d2gsToServer, 'd2gsToServer', data)
}

function displayMcpToServer (data) {
  displayParsed(mcpToServer, 'mcpToServer', data)
}

function displayMcpToClient (data) {
  displayParsed(mcpToClient, 'mcpToClient', data)
}

function displaySidToServer (data) {
  displayParsed(sidToServer, 'sidToServer', data, true)
}

function displaySidToClient (data) {
  displayParsed(sidToClient, 'sidToClient', data)
}

const challengeParserClient = new Parser(bnftpToClient, 'CHALLENGE')
challengeParserClient.on('error', err => console.log('bnftpToClient challenge error : ', err.message))
challengeParserClient.on('data', (parsed) => {
  console.info('bnftpToClient challenge : ', JSON.stringify(parsed))
})

const protocolParserClient = new Parser(bnftpToClient, 'FILE_TRANSFER_PROTOCOL')
protocolParserClient.on('error', err => console.log('bnftpToClient protocol error : ', err.message))
protocolParserClient.on('data', (parsed) => {
  console.info('bnftpToClient protocol : ', JSON.stringify(parsed))
})

function displayBnftpToClient (data) {
  try {
    protocolParserClient.write('FILE_TRANSFER_PROTOCOL')
    // console.log('bnftpToClient protocol: ', JSON.stringify(bnftpToClient.parsePacketBuffer('FILE_TRANSFER_PROTOCOL', data).data))
  } catch (error) {
    console.log('bnftpToClient error: ', error)
    console.log('bnftpToClient protocol: ', data)
    // challengeParserClient.write(data)
  }
}

const challengeParserServer = new Parser(bnftpToServer, 'CHALLENGE')
challengeParserServer.on('error', err => console.log('bnftpToServer bnftp error : ', err.message))
challengeParserServer.on('data', (parsed) => {
  console.info('bnftpToServer challenge : ', JSON.stringify(parsed))
})
const protocolParserServer = new Parser(bnftpToServer, 'FILE_TRANSFER_PROTOCOL')
protocolParserServer.on('error', err => console.log('bnftpToServer bnftp error : ', err.message))
protocolParserServer.on('data', (parsed) => {
  console.info('bnftpToServer protocol : ', JSON.stringify(parsed))
})
function displayBnftpToServer (data) {
  try {
    protocolParserServer.write('FILE_TRANSFER_PROTOCOL')
    // console.log('bnftpToServer protocol: ', JSON.stringify(bnftpToServer.parsePacketBuffer('FILE_TRANSFER_PROTOCOL', data).data))
    // console.log('bnftpToServer protocol: ', data)
  } catch (error) {
    console.log('bnftpToServer error: ', error)
    console.log('bnftpToServer write challenge', data)
    // challengeParserServer.write(data)
  }
}

// tracker emits sessions, and sessions emit data
tcpTracker.on('session', function (session) {
  const srcPort = session.src_name.split(':')[1]
  const dstPort = session.dst_name.split(':')[1]
  if (!trackedPorts.has(srcPort) && !trackedPorts.has(dstPort)) {
    return
  }

  /*
  if (dstPort === sidPort) {
    if (clientPortSid === null) {
      console.log('zalloooo')
      clientPortSid = srcPort
    } else {
      clientPortBnFtp = srcPort
    }
  }
  if (srcPort === sidPort) {
    if (clientPortSid === null) {
      clientPortSid = dstPort
    } else {
      clientPortBnFtp = dstPort
    }
  } */

  session.on('start', function () {
    if (srcPort === d2gsPort || dstPort === d2gsPort) {
      console.log('Start of d2gs session')
    }
    if (srcPort === mcpPort || dstPort === mcpPort) {
      console.log('Start of mcp session')
    }
    if (srcPort === sidPort || dstPort === sidPort) {
      console.log('Start of sid session')
    }
  })
  session.on('data send', function (session, data) {
    if (srcPort === d2gsPort) {
      displayD2gsToClient(data)
    }

    if (dstPort === d2gsPort) {
      displayD2gsToServer(data)
    }

    if (srcPort === mcpPort) {
      displayMcpToClient(data)
    }

    if (dstPort === mcpPort) {
      displayMcpToServer(data)
    }

    if (dstPort === sidPort && data.length === 1 && data[0] === 1) {
      console.log(`sid on port ${srcPort} : ${data}`)
      clientPortSid = srcPort
      return
    }

    if (dstPort === sidPort && data.length === 1 && data[0] === 2) {
      console.log(`bnftp on port ${srcPort} : ${data}`)
      clientPortBnFtp = srcPort
      return
    }

    if (srcPort === sidPort && dstPort === clientPortSid) {
      displaySidToClient(data)
    }

    if (dstPort === sidPort && srcPort === clientPortSid) {
      displaySidToServer(data)
    }

    if (srcPort === sidPort && dstPort === clientPortBnFtp) {
      displayBnftpToClient(data)
    }

    if (dstPort === sidPort && srcPort === clientPortBnFtp) {
      displayBnftpToServer(data)
    }
  })
  session.on('data recv', function (session_, data) {
    if (srcPort === d2gsPort) {
      displayD2gsToServer(data)
    }

    if (dstPort === d2gsPort) {
      displayD2gsToClient(data)
    }

    if (srcPort === mcpPort) {
      displayMcpToServer(data)
    }

    if (dstPort === mcpPort) {
      displayMcpToClient(data)
    }

    if (srcPort === sidPort && data.length === 1 && data[0] === 1) {
      console.log(`sid on port ${dstPort} : ${data}`)
      clientPortSid = dstPort
      return
    }

    if (srcPort === sidPort && data.length === 1 && data[0] === 2) {
      console.log(`bnftp on port ${dstPort} : ${data}`)
      clientPortBnFtp = dstPort
      return
    }

    if (srcPort === sidPort && dstPort === clientPortSid) {
      displaySidToServer(data)
    }

    if (dstPort === sidPort && srcPort === clientPortSid) {
      displaySidToClient(data)
    }

    if (srcPort === sidPort && dstPort === clientPortBnFtp) {
      displayBnftpToServer(data)
    }

    if (dstPort === sidPort && srcPort === clientPortBnFtp) {
      displayBnftpToClient(data)
    }
  })

  session.on('end', function () {
    if (srcPort === d2gsPort || dstPort === d2gsPort) {
      console.log('End of d2gs session')
    }
    if (srcPort === mcpPort || dstPort === mcpPort) {
      console.log('End of mcp session')
    }
    if (srcPort === sidPort || dstPort === sidPort) {
      console.log('End of sid session')
    }
  })
})

console.log('loaded')

// Set view engine to use, in this case 'pug'
app.set('view engine', 'pug')

app.get('/', (req, res) => {
  res.render('index', { title: 'Sniffer', messagesToClient: messagesToClient, messagesToServer: messagesToServer })
})
app.listen(process.env.PORT || 3001)
