const EventEmitter = require('events').EventEmitter

class ClientDiablo extends EventEmitter {
  setClientSid (clientSid) {
    this.clientSid = clientSid
    this.clientSid.on('packet', ({ name, params }) => {
      this.emit(name, params)
      this.emit('packet', { name, params, protocol: this.clientSid.isServer ? 'sidToServer' : 'sidToClient' })
    })
  }

  setClientMcp (clientMcp) {
    this.clientMcp = clientMcp
    this.clientMcp.on('packet', ({ name, params }) => {
      this.emit(name, params)
      this.emit('packet', { name, params, protocol: this.clientMcp.isServer ? 'mcpToServer' : 'mcpToClient' })
    })
  }

  setClientBnftp (clientBnftp) {
    this.clientBnftp = clientBnftp
    this.clientBnftp.on('packet', ({ name, params }) => {
      this.emit(name, params)
      this.emit('packet', { name, params, protocol: this.clientBnftp.isServer ? 'bnftpToServer' : 'bnftpToClient' })
    })
  }

  setClientD2gs (clientD2gs) {
    this.clientD2gs = clientD2gs
    this.clientD2gs.on('packet', ({ name, params }) => {
      this.emit(name, params)
      this.emit('packet', { name, params, protocol: this.clientD2gs.isServer ? 'd2gsToServer' : 'd2gsToClient' })
    })
  }

  write (name, params) {
    if (name.startsWith('SID')) {
      this.emit('sentPacket', { name, params, protocol: this.clientSid.isServer ? 'sidToClient' : 'sidToServer' })
      this.clientSid.write(name, params)
    } else if (name.startsWith('MCP')) {
      this.emit('sentPacket', { name, params, protocol: this.clientMcp.isServer ? 'mcpToClient' : 'mcpToServer' })
      this.clientMcp.write(name, params)
    } else if (name.startsWith('FILE_TRANSFER_PROTOCOL')) {
      this.emit('sentPacket', { name, params, protocol: this.clientBnftp.isServer ? 'bnftpToClient' : 'bnftpToServer' })
      this.clientBnftp.write(name, params)
    } else if (name.startsWith('D2GS')) {
      this.emit('sentPacket', { name, params, protocol: this.clientD2gs.isServer ? 'd2gsToClient' : 'd2gsToServer' })
      this.clientD2gs.write(name, params)
    }
  }
}

module.exports = ClientDiablo
