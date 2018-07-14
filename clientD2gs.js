const net = require('net');

const ProtoDef = require("protodef").ProtoDef;
const protocol = require('./data/d2gs');
const EventEmitter = require('events').EventEmitter;
const {compress,decompress, getPacketSize} = require('./compression');

const {createSplitter, createFramer} = require('./splitter');

const protoToServer = new ProtoDef();
protoToServer.addProtocol(protocol,["toServer"]);


const protoToClient = new ProtoDef();
protoToClient.addProtocol(protocol,["toClient"]);

class Client extends EventEmitter
{
  constructor({host,port}) {
    super();
    this.host = host;
    this.port = port;
    this.compression = false;
    this.splitter = createSplitter();
    this.framer = createFramer();
    this.framer.on('data', data => this.socket.write(data))
    this.splitter.on('data', compressedData => {
      const data = decompress(compressedData);
      const parsed = protoToClient.parsePacketBuffer("packet",data).data;

      const {name,params} = parsed;
      console.info("received compressed packet", name, params);

      this.emit(name,params);
    });
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

      if (!this.compression) {
        console.info("sending uncompressed packet", packet_name, params);
        this.socket.write(buffer);
      }
      else {
        console.info("sending compressed packet", packet_name, params);
        this.framer.write(compress(buffer));
      }
    }
    catch (err) {
      console.log(err);
    }
  }
}


module.exports = Client;
