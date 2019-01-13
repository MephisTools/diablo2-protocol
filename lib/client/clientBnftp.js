const net = require('net')

const ProtoDef = require('protodef').ProtoDef
const Parser = require('protodef').Parser
const bnftp = require('../../data/bnftp')
const EventEmitter = require('events').EventEmitter

const bnftpToServer = new ProtoDef()
bnftpToServer.addProtocol(bnftp, ['toServer'])

const bnftpToClient = new ProtoDef()
bnftpToClient.addProtocol(bnftp, ['toClient'])

class Client extends EventEmitter {
  constructor (isServer) {
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
      // console.log('received that hex bnftp', data.toString('hex'))
    })

    const proto = this.isServer ? bnftpToClient : bnftpToServer

    const parser = new Parser(proto, 'FILE_TRANSFER_PROTOCOL')

    parser.on('data', (parsed) => {
      this.emit('FILE_TRANSFER_PROTOCOL', parsed)
      console.info('received packet FILE_TRANSFER_PROTOCOL', JSON.stringify(parsed))
    })

    parser.on('error', err => console.log('bnftp error : ', err.message))

    this.socket.pipe(parser)

    this.socket.on('end', () => {
      console.log('disconnected from server bnftp')
    })
  }

  write (name, params) {
    const proto = this.isServer ? bnftpToClient : bnftpToServer

    const buffer = proto.createPacketBuffer('FILE_TRANSFER_PROTOCOL', params)
    console.info('sending packet FILE_TRANSFER_PROTOCOL', params)

    buffer.writeInt16LE(buffer.length, 0)

    this.socket.write(buffer)
  }
}

module.exports = Client
