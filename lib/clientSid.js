const net = require('net')

const ProtoDef = require('protodef').ProtoDef
const sid = require('../data/sid')
const EventEmitter = require('events').EventEmitter

const protoToServer = new ProtoDef()
protoToServer.addProtocol(sid, ['toServer'])

const protoToClient = new ProtoDef()
protoToClient.addProtocol(sid, ['toClient'])

class Client extends EventEmitter {
  constructor ({ host, port }) {
    super()
    this.host = host
    this.port = port
  }

  connect () {
    this.socket = net.createConnection({ port: this.port, host: this.host }, () => {
      this.emit('connect')
    })

    this.socket.on('data', (data) => {
      console.log('received that hex sid', data.toString('hex'))
      const parsed = protoToClient.parsePacketBuffer('packet', data).data

      const { name, params } = parsed
      console.info('received packet', name, JSON.stringify(params))

      this.emit(name, params)
      this.emit('packet', { name, params })
    })
    this.socket.on('end', () => {
      console.log('disconnected from server')
    })
  }

  write (packetName, params) {
    const buffer = protoToServer.createPacketBuffer('packet', {
      name: packetName,
      size: 0,
      ff: 255,
      params
    })

    console.info('sending packet', packetName, JSON.stringify(params))
    buffer.writeInt16LE(buffer.length, 2)

    this.socket.write(buffer)
  }
}

module.exports = Client
