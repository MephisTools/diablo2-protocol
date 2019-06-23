const net = require('net')

const ProtoDef = require('protodef').ProtoDef
const Parser = require('protodef').Parser
const bnftp = require('../../data/1.14/bnftp')
const EventEmitter = require('events').EventEmitter

const bnftpToServer = new ProtoDef(false)
bnftpToServer.addProtocol(bnftp, ['toServer'])

const bnftpToClient = new ProtoDef(false)
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
      this.socket.unpipe(parser)
      const challengeParser = new Parser(proto, 'CHALLENGE')
      challengeParser.on('data', (parsed) => {
        this.emit('CHALLENGE', parsed)
        console.info('received packet CHALLENGE', JSON.stringify(parsed))
      })
      challengeParser.on('error', err => console.log('CHALLENGE bnftp error : ', err.message))
      this.socket.pipe(challengeParser)

      this.socket.on('end', () => {
        console.log('disconnected from server bnftp')
      })
    })

    parser.on('error', err => console.log('FILE_TRANSFER_PROTOCOL bnftp error : ', err.message))

    this.socket.pipe(parser)

    this.socket.on('end', () => {
      console.log('disconnected from server bnftp')
    })
  }

  write (name, params) {
    const proto = this.isServer ? bnftpToClient : bnftpToServer

    const buffer = proto.createPacketBuffer(name, params)
    console.info(`sending packet ${name}`, params)

    if (name === 'FILE_TRANSFER_PROTOCOL') buffer.writeInt16LE(buffer.length, 0)

    this.socket.write(buffer)
  }
}

module.exports = Client
