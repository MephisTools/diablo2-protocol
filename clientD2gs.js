const net = require('net');

const ProtoDef = require("protodef").ProtoDef;
const Parser = require('protodef').Parser
const protocol = require('./data/d2gs');
const EventEmitter = require('events').EventEmitter;
const {compress,decompress} = require('./compression');
const d2gsReader = require('./d2gsSpecialReader');

const {createSplitter, createFramer} = require('./splitter');

const protoToServer = new ProtoDef();
protoToServer.addTypes(d2gsReader);
protoToServer.addProtocol(protocol,["toServer"]);


const protoToClient = new ProtoDef();
protoToClient.addTypes(d2gsReader);
protoToClient.addProtocol(protocol,["toClient"]);

const toClientParser = new Parser(protoToClient, 'packet')

class Client extends EventEmitter
{
  constructor({host,port}) {
    super();
    this.host = host;
    this.port = port;
    this.compression = false;
    this.splitter = createSplitter();
    this.framer = createFramer();
    this.framer.on('data', data => {
      console.log("sending buffer d2gs "+data.toString("hex"))
      this.socket.write(data)
    })
    this.splitter.on('data', data => {


      const uncompressedData = decompress(data);

      toClientParser.write(uncompressedData);
    });

    toClientParser.on('data', ({data}) => {
      const {name,params} = data;
      console.info("received compressed packet", name, params);

      this.emit(name,params);
    })
  }

  enableCompression() {
    this.compression = true;
  }

  connect() {
    this.socket = net.createConnection({ port: this.port, host:this.host }, () => {
      this.emit('connect');
    });


    this.socket.on('data', (data) => {
      //data = decompress(data);
      console.log("received that d2gs hex", data.toString("hex"));


      if(!this.compression) {
        if(data[0] !== 0xaf)
          data = data.slice(1);

        const parsed = protoToClient.parsePacketBuffer("packet",data).data;

        const {name,params} = parsed;
        console.info("received uncompressed packet", name, params);

        this.emit(name,params);
      }
      else {
        this.splitter.write(data);
      }
    });


    this.socket.on('end', () => {
      console.log('disconnected from server');
    });

  }

  write(packet_name, params) {

    try {
      const buffer = protoToServer.createPacketBuffer("packet", {
        name: packet_name,
        params
      });

      if (!this.compression || true) { // always sent uncompressed
        console.info("sending uncompressed packet", packet_name, params);
        this.socket.write(buffer);
      }
      else {
        console.info("sending compressed packet", packet_name, params);

        const bufferAfterId = buffer.slice(1);

        const bufferCompressed = compress(bufferAfterId);

        const correctBuffer = Buffer.alloc(bufferCompressed.length+1);

        buffer.copy(correctBuffer,0, 0, 1);

        bufferAfterId.copy(correctBuffer, 1)

        this.framer.write(bufferCompressed);
      }
    }
    catch (err) {
      console.log(err);
    }
  }
}


module.exports = Client;
