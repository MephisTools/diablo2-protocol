const net = require('net')
const ClientD2gs = require('../client/clientD2gs')
const EventEmitter = require('events').EventEmitter

class ServerD2gs extends EventEmitter {
  listen (host, port) {
    this.host = host
    this.port = port
    this.socketServer = net.createServer()

    this.socketServer.on('connection', socket => {
      const client = new ClientD2gs(true)

      client.setSocket(socket)

      this.emit('connection', client)
    })

    this.socketServer.listen(this.port, this.host)
  }
}

module.exports = ServerD2gs
