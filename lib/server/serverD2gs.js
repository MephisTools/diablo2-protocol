const net = require('net')

const ProtoDef = require('protodef').ProtoDef
const protocol = require('../data/d2gs')
const EventEmitter = require('events').EventEmitter
const { compress } = require('./compression')
const d2gsReader = require('./d2gsSpecialReader')

const { createSplitter, createFramer } = require('./splitter')

const protoToServer = new ProtoDef()
protoToServer.addTypes(d2gsReader)
protoToServer.addProtocol(protocol, ['toServer'])

const protoToClient = new ProtoDef()
protoToClient.addTypes(d2gsReader)
protoToClient.addProtocol(protocol, ['toClient'])

class Server extends EventEmitter {
  constructor ({ host, port }) {
    super()
    this.host = host
    this.port = port
    this.compression = false
    this.splitter = createSplitter()
    this.framer = createFramer()
    this.framer.on('data', data => {
      // console.log('sending buffer d2gs ' + data.toString('hex'))
      this.socket.write(data)
    })
  }

  enableCompression () {
    this.compression = true
  }

  createServer () {
    this.socket = net.createServer({ port: this.port, host: this.host }, () => {
      this.emit('connect')
    })

    this.socket.listen(this.port, this.host)

    this.socket.on('data', (data) => {
      const parsed = protoToClient.parsePacketBuffer('packet', data).data

      const { name, params } = parsed
      console.info('received packet D2GS', name, params)

      this.emit(name, params)
    })

    this.socket.on('end', () => {
      console.log('disconnected from client')
    })
  }

  write (packetName, params) {
    try {
      const buffer = protoToServer.createPacketBuffer('packet', {
        name: packetName,
        params
      })

      console.info('sending compressed packet', packetName, params)
      this.socket.write(compress(buffer))
    } catch (err) {
      console.log(err)
    }
  }
}

module.exports = Server
