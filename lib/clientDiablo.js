const EventEmitter = require('events').EventEmitter

class ClientDiablo extends EventEmitter {
  setClientSid (clientSid) {
    this.clientSid = clientSid
    this.clientSid.on('packet', ({ name, params }) => {
      this.emit(name, params)
    })
  }

  setClientMcp (clientMcp) {
    this.clientMcp = clientMcp
    this.clientMcp.on('packet', ({ name, params }) => {
      this.emit(name, params)
    })
  }

  setClientBnftp (clientBnftp) {
    this.clientBnftp = clientBnftp
    this.clientBnftp.on('packet', ({ name, params }) => {
      this.emit(name, params)
    })
  }

  setClientD2gs (clientD2gs) {
    this.clientD2gs = clientD2gs
    this.clientD2gs.on('packet', ({ name, params }) => {
      this.emit(name, params)
    })
  }

  write (name, params) {
    if (name.startsWith('SID')) {
      this.clientSid.write(name, params)
    } else if (name.startsWith('MCP')) {
      this.clientMcp.write(name, params)
    } else if (name.startsWith('FILE_TRANSFER_PROTOCOL')) {
      this.clientBnftp.write(name, params)
    } else if (name.startsWith('D2GS')) {
      this.clientD2gs.write(name, params)
    }
  }
}

module.exports = ClientDiablo
