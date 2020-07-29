const EventEmitter = require('events').EventEmitter

class ClientDiablo extends EventEmitter {
  constructor (version) {
    super()
    this.version = version
  }

  setClientSid (clientSid) {
    this.clientSid = clientSid
    this.clientSid.on('packet', ({ name, params, toServer }) => {
      this.emit(name, params)
      this.emit('packet', { name, params, toServer })
    })
    this.clientSid.on('error', err => this.emit('error', err))
  }

  setClientMcp (clientMcp) {
    this.clientMcp = clientMcp
    this.clientMcp.on('packet', ({ name, params, toServer }) => {
      this.emit(name, params)
      this.emit('packet', { name, params, toServer })
    })
    this.clientMcp.on('error', err => this.emit('error', err))

  }

  setClientBnftp (clientBnftp) {
    this.clientBnftp = clientBnftp
    this.clientBnftp.on('packet', ({ name, params, toServer }) => {
      this.emit(name, params)
      this.emit('packet', { name, params, toServer })
    })
    this.clientBnftp.on('error', err => this.emit('error', err))

  }

  setClientD2gs (clientD2gs) {
    this.clientD2gs = clientD2gs
    this.clientD2gs.on('packet', ({ name, params, toServer, raw }) => {
      this.emit(name, params)
      this.emit('packet', { name, params, toServer, raw })
    })
    this.clientD2gs.on('error', err => this.emit('error', err))
  }

  write (name, params) {
    setTimeout(() => {
      if (name.startsWith('SID')) {
        this.emit('sentPacket', { name, params, toServer: !this.clientSid.isServer })
        this.clientSid.write(name, params)
      } else if (name.startsWith('MCP')) {
        this.emit('sentPacket', { name, params, toServer: !this.clientMcp.isServer })
        this.clientMcp.write(name, params)
      } else if (name.startsWith('FILE_TRANSFER_PROTOCOL')) {
        this.emit('sentPacket', { name, params, toServer: !this.clientBnftp.isServer })
        this.clientBnftp.write(name, params)
      } else if (name.startsWith('D2GS')) {
        this.emit('sentPacket', { name, params, toServer: !this.clientD2gs.isServer })
        this.clientD2gs.write(name, params)
      }
    }, this.delayPackets) // Delay between packets, TODO: issue with async ? ...
  }
}

module.exports = ClientDiablo
