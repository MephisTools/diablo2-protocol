const net = require('net')
const ClientMcp = require('../client/clientMcp')
const EventEmitter = require('events').EventEmitter

class ServerSid extends EventEmitter {
  listen (host, port) {
    this.host = host
    this.port = port
    this.socketServer = net.createServer()

    this.socketServer.on('connection', socket => {
      const client = new ClientMcp(true)

      client.setSocket(socket)

      this.emit('connection', client)
    })

    this.socketServer.on('listening', () => {
      console.log('server mcp listening')
    })

    this.socketServer.listen(this.port, this.host)
  }
}

module.exports = ServerSid
