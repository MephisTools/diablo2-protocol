const net = require('net')
const ClientBnftp = require('../client/clientBnftp')
const EventEmitter = require('events').EventEmitter

class ServerBnftp extends EventEmitter {
  listen (host, port) {
    this.host = host
    this.port = port
    this.socketServer = net.createServer()

    this.socketServer.on('connection', socket => {
      const client = new ClientBnftp(true)

      client.setSocket(socket)

      this.emit('connection', client)
    })

    this.socketServer.listen(this.port, this.host)
  }
}

module.exports = ServerBnftp
