const net = require('net')

const ProtoDef = require('protodef').ProtoDef
const Parser = require('protodef').Parser
const bnftp = require('./data/bnftp')
const EventEmitter = require('events').EventEmitter

const bnftpToServer = new ProtoDef()
bnftpToServer.addProtocol(bnftp, ['toServer'])

const bnftpToClient = new ProtoDef()
bnftpToClient.addProtocol(bnftp, ['toClient'])

const parser = new Parser(bnftpToServer, 'FILE_TRANSFER_PROTOCOL')

class Server extends EventEmitter {
  constructor ({ host, port }) {
    super()
    this.host = host
    this.port = port
  }

  createServer () {
    this.socket = net.createServer({ port: this.port, host: this.host }, () => {
      this.emit('createServer')
    })

    this.socket.listen(this.port, this.host)

    this.socket.on('data', (data) => {
      console.log('received that hex bnftp', data.toString('hex'))
    })
    parser.on('data', (parsed) => {
      this.emit('FILE_TRANSFER_PROTOCOL', parsed)
      console.info('received packet FILE_TRANSFER_PROTOCOL', parsed)
    })

    parser.on('error', err => console.log('bnftp error : ', err.message))

    this.socket.pipe(parser)

    this.socket.on('end', () => {
      console.log('disconnected from client')
    })
  }

  write (name, params) {
    const buffer = bnftpToClient.createPacketBuffer('FILE_TRANSFER_PROTOCOL', params)
    console.info('sending packet FILE_TRANSFER_PROTOCOL', params)

    buffer.writeInt16LE(buffer.length, 0)

    this.socket.write(buffer)
  }
}

module.exports = Server
