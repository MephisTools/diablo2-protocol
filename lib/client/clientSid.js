const net = require('net')

const ProtoDef = require('protodef').ProtoDef
const sid = require('../../data/sid')
const EventEmitter = require('events').EventEmitter

const protoToServer = new ProtoDef()
protoToServer.addProtocol(sid, ['toServer'])

const protoToClient = new ProtoDef()
protoToClient.addProtocol(sid, ['toClient'])

class Client extends EventEmitter {
  constructor (isServer = false) {
    super()
    this.isServer = isServer
  }

  connect (host, port) {
    this.host = host
    this.port = port
    this.setSocket(net.createConnection({ port: this.port, host: this.host }, () => {
      this.emit('connect')
    }))
  }

  setSocket (socket) {
    this.socket = socket
    this.socket.on('data', (data) => {
      try {
        // console.log('received that hex sid', data.toString('hex'))
        if (data.length === 1 && data[0] === 0x01) {
          this.emit('init_connection')
          return
        }
        const proto = this.isServer ? protoToServer : protoToClient
        const parsed = proto.parsePacketBuffer('packet', data).data

        const { name, params } = parsed
        console.info('received packet', name, JSON.stringify(parsed))

        this.emit(name, params)
        this.emit('packet', { name, params })
      } catch (err) {
        console.log(err.message)
      }
    })
    this.socket.on('end', () => {
      console.log('disconnected from server sid')
    })
  }

  write (packetName, params) {
    const proto = this.isServer ? protoToClient : protoToServer
    const buffer = proto.createPacketBuffer('packet', {
      name: packetName,
      size: 0,
      ff: 255,
      params
    })

    console.info('sending packet', packetName, params)
    buffer.writeInt16LE(buffer.length, 2)

    this.socket.write(buffer)
  }
}

module.exports = Client
