const ProtoDef = require('protodef').ProtoDef
const BaseClient = require('./baseClient')

class Client extends BaseClient {
  constructor (version, isServer = false) {
    super(version, isServer)
    const mcp = require(`../../data/${version}/mcp`)
    this.protoToServer = new ProtoDef(false)
    this.protoToServer.addProtocol(mcp, ['toServer'])

    this.protoToClient = new ProtoDef(false)
    this.protoToClient.addProtocol(mcp, ['toClient'])
  }

  write (name, params) {
    const proto = this.isServer ? this.protoToClient : this.protoToServer
    const buffer = proto.createPacketBuffer('packet', {
      size: 0,
      name: name,
      params
    })
    buffer.writeInt16LE(buffer.length, 0)
    this.socket.write(buffer)
  }
}

module.exports = Client
