const ClientDiablo = require('../client/clientDiablo')

const EventEmitter = require('events').EventEmitter

class ServerDiablo extends EventEmitter {
  constructor () {
    super()
    this.clients = {}
  }

  setServerSid (serverSid) {
    this.serverSid = serverSid
    this.serverSid.on('connection', clientSid => {
      const address = clientSid.socket.address().address
      const clientDiablo = this._getOrCreateClientDiablo(address)
      clientDiablo.setClientSid(clientSid)
    })
  }

  setServerMcp (serverMcp) {
    this.serverMcp = serverMcp
    this.serverMcp.on('connection', clientMcp => {
      const address = clientMcp.socket.address().address
      const clientDiablo = this._getOrCreateClientDiablo(address)
      clientDiablo.setClientSid(clientMcp)
    })
  }

  setServerBnftp (serverBnftp) {
    this.serverBnftp = serverBnftp
    this.serverBnftp.on('connection', clientBnftp => {
      const address = clientBnftp.socket.address().address
      const clientDiablo = this._getOrCreateClientDiablo(address)
      clientDiablo.setClientSid(clientBnftp)
    })
  }

  setServerD2gs (serverD2gs) {
    this.serverD2gs = serverD2gs
    this.serverD2gs.on('connection', clientD2gs => {
      const address = clientD2gs.socket.address().address
      const clientDiablo = this._getOrCreateClientDiablo(address)
      clientDiablo.setClientSid(clientD2gs)
    })
  }

  _getOrCreateClientDiablo (address) {
    if (this.clients[address] === undefined) {
      this.clients[address] = new ClientDiablo()
      this.emit('connection', this.clients[address])
    }
    return this.clients[address]
  }
}

module.exports = ServerDiablo
