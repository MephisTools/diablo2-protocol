const net = require('net')

const ProtoDef = require('protodef').ProtoDef
const FullPacketParser = require('protodef').Parser
const EventEmitter = require('events').EventEmitter
const {decompress} = require('../utils/compression')
const d2gsReader = require('../utils/d2gsSpecialReader')
const bitfieldLE = require('../utils/bitfieldLE')

const {createSplitter, createFramer} = require('../utils/splitter')
// const IGNORED_PACKETS = [0x01, 0xF1, 0x02] // Non debugged packets that just pollute
const LOGIN_PACKETS = [0xAF]

class Client extends EventEmitter {
  constructor(version, isServer = false, includeRaw = false) {
    super()
    this.compression = false
    this.isServer = isServer
    this.version = version
    this.includeRaw = includeRaw
    const protocol = require(`../../data/${version}/d2gs`)
    this.protoToServer = new ProtoDef(false)
    this.protoToServer.addTypes(d2gsReader)
    this.protoToServer.addTypes(bitfieldLE)
    this.protoToServer.addProtocol(protocol, ['toServer'])

    this.protoToClient = new ProtoDef(false)
    this.protoToClient.addTypes(d2gsReader)
    this.protoToClient.addTypes(bitfieldLE)
    this.protoToClient.addProtocol(protocol, ['toClient'])
    this.toClientParser = new FullPacketParser(this.protoToClient, 'packet')
    this.splitter = createSplitter()
    // this.splitter.sloppyMode = true
    this.framer = createFramer()
    this.splitter.on('data', data => {
      try {
        const uncompressedData = decompress(data)
        this.toClientParser.write(uncompressedData)
      } catch (err) {
        this.emit('error', err)
      }
    })
    this.toClientParser.on('data', ({data, buffer}) => {
      let {name, params} = data
      this.emit(name, params)
      const toServer = false
      if (this.includeRaw) {
        const raw = buffer
        this.emit('packet', {name, params, toServer, raw})
      } else this.emit('packet', {name, params, toServer})
    })
    this.toClientParser.on('error', err => this.emit('error', err))
  }

  connect(host, port) {
    this.host = host
    this.port = port
    this.setSocket(net.createConnection({port: this.port, host: this.host}, () => {
      this.emit('connect')
    }))
  }

  /**
   * Parse a packet, should emit the parsed packet if no error
   * @param data raw data
   * @param toServer to server or to client
   */
  parse(data, toServer) {
    // if (IGNORED_PACKETS.includes(data[0])) return
    let parsed
    try {
      // Message to client
      if (!toServer) {
        // Uncompressed
        if (!this.compression) {
          // TODO: why we need this ?
          if (data[0] === 0x2b && this.isServer === true) {
            return
          }
          // Not sure optimal conditions, anyway required in some servers
          if (this.version === 1.13 &&
            !LOGIN_PACKETS.includes(data[0]) &&
            this.isServer === false) {
            data = data.slice(1)
          }
          parsed = this.protoToClient.parsePacketBuffer('packet', data).data
          if (parsed.name === 'D2GS_NEGOTIATECOMPRESSION') this.enableCompression()
        } else { // Compressed, need to be split-ed and uncompressed
          this.splitter.write(data)
          return
        }
      } else { // Message to server
        parsed = this.protoToServer.parsePacketBuffer('packet', data).data
      }
      const {name, params} = parsed
      this.emit(name, params)
      if (this.includeRaw) {
        const raw = data
        this.emit('packet', {name, params, toServer, raw})
      }
      else this.emit('packet', {name, params, toServer})
    } catch (err) {
      this.emit('error', err)
    }
  }

  setSocket(socket) {
    this.socket = socket
    this.framer.on('data', data => {
      this.socket.write(data)
    })
    this.socket.on('data', (data) => {
      this.parse(data, this.isServer)
    })
    this.socket.on('end', () => {
      this.emit('end')
    })
  }

  enableCompression() {
    this.compression = true
  }

  write(packetName, params) {
    const proto = this.isServer ? this.protoToClient : this.protoToServer
    try {
      const buffer = proto.createPacketBuffer('packet', {
        name: packetName,
        params
      })
      const buffer2 = this.isServer && packetName !== 'D2GS_NEGOTIATECOMPRESSION' ? Buffer.concat([Buffer.from([buffer.length + 1]), buffer]) : buffer
      this.socket.write(buffer2)
    } catch (err) {
      this.emit('error', err)
    }
  }
}

module.exports = Client
