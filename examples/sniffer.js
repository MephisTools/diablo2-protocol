if (process.argv.length !== 3) {
  console.log('Usage : node sniffer.js <networkInterface>')
  process.exit(1)
}

const networkInterface = process.argv[2]

const util = require('util')

const pcap = require('pcap')

const tcpTracker = new pcap.TCPTracker()

const pcapSession = pcap.createSession(networkInterface, 'ip proto \\tcp')

pcapSession.on('packet', function (rawPacket) {
  const packet = pcap.decode.packet(rawPacket)
  tcpTracker.track_packet(packet)
})

tcpTracker.on('start', function (session) {
  console.log('Start of TCP session between ' + session.src + ' and ' + session.dst)
})

setInterval(function () {
  const stats = pcapSession.stats()
  if (stats.ps_drop > 0) {
    console.log('pcap dropped packets: ' + util.inspect(stats))
  }
}, 5000)

const Parser = require('protodef').Parser
const ProtoDef = require('protodef').ProtoDef

const mcp = require('../data/mcp')

const mcpToServer = new ProtoDef()
mcpToServer.addProtocol(mcp, ['toServer'])

const mcpToClient = new ProtoDef()
mcpToClient.addProtocol(mcp, ['toClient'])

const sid = require('../data/sid')

const sidToServer = new ProtoDef()
sidToServer.addProtocol(sid, ['toServer'])

const sidToClient = new ProtoDef()
sidToClient.addProtocol(sid, ['toClient'])

const bnftp = require('../data/bnftp')

const bnftpToServer = new ProtoDef()
bnftpToServer.addProtocol(bnftp, ['toServer'])

const bnftpToClient = new ProtoDef()
bnftpToClient.addProtocol(bnftp, ['toClient'])

const { createSplitter } = require('../lib/splitter')

const { decompress } = require('../lib/compression')

const d2gsProto = require('../data/d2gs')

const d2gsReader = require('../lib/d2gsSpecialReader')

const d2gsToClient = new ProtoDef()
d2gsToClient.addTypes(d2gsReader)
d2gsToClient.addProtocol(d2gsProto, ['toClient'])

const d2gsToServer = new ProtoDef()
d2gsToServer.addProtocol(d2gsProto, ['toServer'])

const toClientParser = new Parser(d2gsToClient, 'packet')
const splitter = createSplitter()

splitter.on('data', data => {
  const uncompressedData = decompress(data)

  console.log('uncompressed d2gs received hex : ' + uncompressedData.toString('hex'))
  toClientParser.write(uncompressedData)
})

toClientParser.on('data', ({ data }) => {
  const { name, params } = data
  console.info('received compressed packet', name, params)
})

let clientPortSid = null
let clientPortBnFtp = null
let compression = true

const trackedPorts = new Set(['6112', '4000', '6113'])

// tracker emits sessions, and sessions emit data
tcpTracker.on('session', function (session) {
  const srcPort = session.src_name.split(':')[1]
  const dstPort = session.dst_name.split(':')[1]
  console.log('bonjour', { srcPort, dstPort })
  if (!trackedPorts.has(srcPort) && !trackedPorts.has(dstPort)) {
    return
  }
  console.log('truc', { srcPort, dstPort })

  if (dstPort === '6112') {
    if (clientPortSid === null) {
      clientPortSid = srcPort
    } else {
      clientPortBnFtp = srcPort
    }
  }
  if (srcPort === '6112') {
    if (clientPortSid === null) {
      clientPortSid = dstPort
    } else {
      clientPortBnFtp = dstPort
    }
  }
  session.on('data send', function (session, data) {
    const srcPort = session.src_name.split(':')[1]
    const dstPort = session.dst_name.split(':')[1]
    console.log('machin', { srcPort, dstPort })
    if (srcPort === '4000') {
      console.log('allo')
      try {
        if (!compression) {
          if (data[0] !== 0xaf) { data = data.slice(1) }

          const parsed = d2gsToClient.parsePacketBuffer('packet', data).data

          const { name, params } = parsed
          console.info('received uncompressed packet', name, params)
          if (name === 'D2GS_NEGOTIATECOMPRESSION' && params.compressionMode !== 0) {
            compression = true
          }
        } else {
          splitter.write(data)
        }
      } catch (error) {
        console.log(error)
      }
    }

    if (dstPort === '4000') {
      try {
        console.log('d2gsToServer : ', JSON.stringify(d2gsToServer.parsePacketBuffer('packet', data)))
      } catch (error) {
        console.log(error)
      }
    }

    if (dstPort === '6113') {
      try {
        if (data.toString('hex') !== '01') { console.log('mcpToServer : ', mcpToServer.parsePacketBuffer('packet', data)) }
      } catch (error) {
        console.log(error)
      }
    }

    if (srcPort === '6113') {
      console.log('mcpToClient : ', mcpToClient.parsePacketBuffer('packet', data))
    }

    if (dstPort === '6112' || srcPort === '6112') {
      console.log({ src: srcPort, dst: dstPort })
    }

    if (dstPort === '6112' && srcPort === clientPortSid) {
      try {
        console.log('sidToServer : ', sidToServer.parsePacketBuffer('packet', data), null, 2)
      } catch (err) {
        console.log(err)
      }
    }

    if (srcPort === '6112' && dstPort === clientPortSid) {
      console.log('sidToClient : ', sidToClient.parsePacketBuffer('packet', data))
    }

    if (dstPort === '6113' && srcPort === clientPortBnFtp) {
      console.log('bnftpToServer : ', bnftpToServer.parsePacketBuffer('packet', data))
    }

    if (srcPort === '6113' && dstPort === clientPortBnFtp) {
      console.log('bnftpToClient : ', bnftpToClient.parsePacketBuffer('packet', data))
    }
  })
  session.on('data recv', function (session, data) {
    // if(srcPort === '4000' || dstPort === '4000')
    //    console.log("data received " + session.recv_bytes_payload + " + " + data.length + " bytes");
  })
  session.on('end', function (session) {
    if ((srcPort === '4000' || dstPort === '4000') ||
            (srcPort === '6112' || dstPort === '6112')) {
      console.log('End of TCP session between ' + session.src_name + ' and ' + session.dst_name)
      console.log('Set stats for session: ', session.session_stats())
    }
  })
})
