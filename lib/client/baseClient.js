const EventEmitter = require('events').EventEmitter
const net = require('net')


/**
 * Abstract Class Client.
 *
 * @class BaseClient
 */
class BaseClient extends EventEmitter {

  constructor(version, isServer = false) {
    super()
    if (this.constructor === BaseClient) {
      throw new Error("Abstract classes can't be instantiated.");
    }
    this.isServer = isServer
    this.protoToServer = null
    this.protoToClient = null
  }

  /**
   * Parse a packet, should emit the parsed packet if no error
   * @param data raw data
   * @param toServer to server or to client
   */
  parse(data, toServer) {
    if (data.length === 1 && data[0] === 0x01) {
      this.emit('init_connection') // TODO: maybe could emit some useful data (ip ..)
      return
    }
    const proto = this.isServer ? this.protoToServer : this.protoToClient
    try {
      const parsed = proto.parsePacketBuffer('packet', data).data
      const {name, params} = parsed
      this.emit(name, params)
      this.emit('packet', {name, params, toServer})
    } catch (err) {
      err.raw = data
      this.emit('error', err)
    }
  }

  connect (host, port) {
    this.host = host
    this.port = port
    this.setSocket(net.createConnection({ port: this.port, host: this.host }, () => {
      this.emit('connect')
    }))
  }

  setSocket (socket) {
    this.socket = socket
    this.socket.on('data', (data) => {
      try {
        this.parse(data, !this.isServer)
      } catch (err) {
        this.emit('error', err)
      }
    })
    this.socket.on('end', () => {
      this.emit('end')
    })
  }
}

module.exports = BaseClient
