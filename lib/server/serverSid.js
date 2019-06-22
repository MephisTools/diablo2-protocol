const net = require('net')
const ClientSid = require('../client/clientSid')
const EventEmitter = require('events').EventEmitter

class ServerSid extends EventEmitter {
  listen (host, port, version) {
    this.host = host
    this.port = port
    this.socketServer = net.createServer()

    this.socketServer.on('connection', socket => {
      const client = new ClientSid(version, true)

      client.setSocket(socket)

      this.emit('connection', client)
    })

    this.socketServer.on('listening', () => {
      console.log('server sid listening')
    })

    this.socketServer.listen(this.port, this.host)
  }
}

module.exports = ServerSid
