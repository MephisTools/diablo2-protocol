const EventEmitter = require('events').EventEmitter

class ServerDiablo extends EventEmitter {
  setServerSid (serverSid) {
    this.serverSid = serverSid
    this.serverSid.on('packet', ({ name, params }) => {
      this.emit(name, params)
    })
  }

  setServerMcp (serverMcp) {
    this.serverMcp = serverMcp
    this.serverMcp.on('packet', ({ name, params }) => {
      this.emit(name, params)
    })
  }

  setServerBnftp (serverBnftp) {
    this.serverBnftp = serverBnftp
    this.serverBnftp.on('packet', ({ name, params }) => {
      this.emit(name, params)
    })
  }

  setServerD2gs (serverD2gs) {
    this.serverD2gs = serverD2gs
    this.serverD2gs.on('packet', ({ name, params }) => {
      this.emit(name, params)
    })
  }

  write (name, params) {
    if (name.startsWith('SID')) {
      this.serverSid.write(name, params)
    } else if (name.startsWith('MCP')) {
      this.serverMcp.write(name, params)
    } else if (name.startsWith('FILE_TRANSFER_PROTOCOL')) {
      this.serverBnftp.write(name, params)
    } else if (name.startsWith('D2GS')) {
      this.serverD2gs.write(name, params)
    }
  }
}

module.exports = ServerDiablo
