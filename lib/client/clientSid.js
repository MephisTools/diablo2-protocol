const ProtoDef = require('protodef').ProtoDef
const BaseClient = require('./baseClient')

class Client extends BaseClient {
  constructor (version, isServer = false) {
    super(version, isServer)
    const sid = require(`../../data/${version}/sid`)
    this.protoToServer = new ProtoDef(false)
    this.protoToServer.addProtocol(sid, ['toServer'])

    this.protoToClient = new ProtoDef(false)
    this.protoToClient.addProtocol(sid, ['toClient'])
  }

  write (name, params) {
    const proto = this.isServer ? this.protoToClient : this.protoToServer
    const buffer = proto.createPacketBuffer('packet', {
      name: name,
      size: 0,
      ff: 255,
      params
    })
    buffer.writeInt16LE(buffer.length, 2)
    this.socket.write(buffer)
  }
}

module.exports = Client
