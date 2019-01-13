if (process.argv.length !== 3) {
  console.log('Usage : node sniffer.js <networkInterface>')
  process.exit(1)
}

const networkInterface = process.argv[2]

const pcap = require('pcap')

const tcpTracker = new pcap.TCPTracker()

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
  mcpProtocol,
  sidProtocol,
  bnftpProtocol,
  createSplitter,
  decompress,
  d2gsProtocol,
  d2gsReader,
  itemParser
} = require('../..')

const mcpToServer = new ProtoDef(false)
mcpToServer.addProtocol(mcpProtocol, ['toServer'])

const mcpToClient = new ProtoDef(false)
mcpToClient.addProtocol(mcpProtocol, ['toClient'])

const sidToServer = new ProtoDef(false)
sidToServer.addProtocol(sidProtocol, ['toServer'])

const sidToClient = new ProtoDef(false)
sidToClient.addProtocol(sidProtocol, ['toClient'])

const bnftpToServer = new ProtoDef(false)
bnftpToServer.addProtocol(bnftpProtocol, ['toServer'])

const bnftpToClient = new ProtoDef(false)
bnftpToClient.addProtocol(bnftpProtocol, ['toClient'])

const d2gsToClient = new ProtoDef(false)
d2gsToClient.addTypes(d2gsReader)
d2gsToClient.addProtocol(d2gsProtocol, ['toClient'])

const d2gsToServer = new ProtoDef(false)
d2gsToServer.addProtocol(d2gsProtocol, ['toServer'])

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
    console.info('d2gsToClient : ', name, JSON.stringify(params))
    messagesToClient.push(`d2gsToClient : ${name} ${JSON.stringify(params)}`)
  } catch (err) {
    console.log(err)
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
      console.info('d2gsToClient (uncompressed): ', name, JSON.stringify(params))
      if (name === 'D2GS_NEGOTIATECOMPRESSION' && params.compressionMode !== 0) {
        compression = true
      }
    } else {
      splitter.write(data)
    }
  } catch (error) {
    console.log('d2gsToClient : ', error.message)
  }
}

function displayParsed (proto, protoName, data) {
  try {
    const { name, params } = proto.parsePacketBuffer('packet', data).data
    console.log(protoName, ':', name, JSON.stringify(params))
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
  displayParsed(sidToServer, 'sidToServer', data)
}

function displaySidToClient (data) {
  displayParsed(sidToClient, 'sidToClient', data)
}

function displayBnftpToClient (data) {
  try {
    console.log('bnftpToClient : ', JSON.stringify(bnftpToClient.parsePacketBuffer('FILE_TRANSFER_PROTOCOL', data).data))
  } catch (error) {
    console.log('bnftpToClient : ', error)
  }
}

function displayBnftpToServer (data) {
  try {
    console.log('bnftpToServer : ', JSON.stringify(bnftpToServer.parsePacketBuffer('FILE_TRANSFER_PROTOCOL', data).data))
  } catch (error) {
    console.log('bnftpToServer : ', error)
  }
}

// tracker emits sessions, and sessions emit data
tcpTracker.on('session', function (session) {
  const srcPort = session.src_name.split(':')[1]
  const dstPort = session.dst_name.split(':')[1]
  if (!trackedPorts.has(srcPort) && !trackedPorts.has(dstPort)) {
    return
  }
  if (dstPort === sidPort) {
    if (clientPortSid === null) {
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
  }

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

// Set view engine to use, in this case 'pug'
app.set('view engine', 'pug')

app.get('/', (req, res) => {
  res.render('index', { title: 'Sniffer', messagesToClient: messagesToClient, messagesToServer: messagesToServer })
})
app.listen(process.env.PORT || 3000)
