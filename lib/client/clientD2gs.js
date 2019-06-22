const net = require('net')

const ProtoDef = require('protodef').ProtoDef
const FullPacketParser = require('protodef').Parser
const EventEmitter = require('events').EventEmitter
const { decompress } = require('../utils/compression')
const d2gsReader = require('../utils/d2gsSpecialReader')
const bitfieldLE = require('../utils/bitfieldLE')
const itemParser = require('../utils/itemParser')

const { createSplitter, createFramer } = require('../utils/splitter')

class Client extends EventEmitter {
  constructor (version, isServer = false) {
    super()
    this.compression = false
    this.isServer = isServer
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

    this.splitter = createSplitter()
    this.framer = createFramer()
    this.framer.on('data', data => {
      // console.log('sending buffer d2gs ' + data.toString('hex'))
      this.socket.write(data)
    })
    this.splitter.on('data', data => {
      // console.log('compressed d2gs received hex : ' + data.toString('hex'))
      const uncompressedData = decompress(data)

      // console.log('after decompression d2gs received hex : ' + uncompressedData.toString('hex'))
      this.toClientParser.write(uncompressedData)
    })

    this.toClientParser.on('data', ({ data, buffer }) => {
      let { name, params } = data

      if (this.isServer === false && (name === 'D2GS_ITEMACTIONWORLD' || name === 'D2GS_ITEMACTIONOWNED')) {
        params = itemParser(buffer)
      }

      console.info('received compressed packet', name, JSON.stringify(params))

      this.emit(name, params)
      this.emit('packet', { name, params })
    })
    this.toClientParser.on('error', err => console.log('d2gsToClient error : ', err.message))

    const proto = this.isServer ? this.protoToServer : this.protoToClient
    this.socket.on('data', (data) => {
      // console.log('received that d2gs hex', data.toString('hex'))

      if (!this.compression) {
        try {
          if (data[0] === 0x2b && this.isServer === true) {
            console.log('received anti-cheat')
            return
          }
          if (data[0] !== 0xaf && this.isServer === false) { data = data.slice(1) }

          const parsed = proto.parsePacketBuffer('packet', data).data

          const { name, params } = parsed
          console.info('received uncompressed packet', name, JSON.stringify(params))

          this.emit(name, params)
          this.emit('packet', { name, params })
        } catch (err) {
          console.log(err.message)
        }
      } else {
        this.splitter.write(data)
      }
    })

    this.socket.on('end', () => {
      console.log('disconnected from server d2gs')
    })
  }

  enableCompression () {
    this.compression = true
  }

  write (packetName, params) {
    const proto = this.isServer ? this.protoToClient : this.protoToServer
    try {
      const buffer = proto.createPacketBuffer('packet', {
        name: packetName,
        params
      })

      console.info('sending uncompressed packet', packetName, params)
      const buffer2 = this.isServer && packetName !== 'D2GS_NEGOTIATECOMPRESSION' ? Buffer.concat([Buffer.from([buffer.length + 1]), buffer]) : buffer
      this.socket.write(buffer2)
      // console.log('sending that hex', buffer2)
    } catch (err) {
      console.log(err)
    }
  }
}

module.exports = Client
