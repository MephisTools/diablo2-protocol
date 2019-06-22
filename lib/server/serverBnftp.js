const net = require('net')
const ClientBnftp113 = require('../client/clientBnftp1.13')
const ClientBnftp114 = require('../client/clientBnftp1.14')
const EventEmitter = require('events').EventEmitter

class ServerBnftp extends EventEmitter {
  listen (host, port, version) {
    this.host = host
    this.port = port
    this.socketServer = net.createServer()

    this.socketServer.on('connection', socket => {
      let client
      if (version === '1.13') {
        client = new ClientBnftp113(true)
      }
      if (version === '1.14') {
        client = new ClientBnftp114(true)
      }
      client.setSocket(socket)

      this.emit('connection', client)
    })

    this.socketServer.on('listening', () => {
      console.log('server bnftp listening')
    })

    this.socketServer.listen(this.port, this.host)
  }
}

module.exports = ServerBnftp
