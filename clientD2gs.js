const net = require('net');

const ProtoDef = require("protodef").ProtoDef;
const protocol = require('./data/d2gs');
const EventEmitter = require('events').EventEmitter;

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
  }

  connect() {
    this.socket = net.createConnection({ port: this.port, host:this.host }, () => {
      this.emit('connect');
    });


    this.socket.on('data', (data) => {
      console.log("received that d2gs hex", data.toString("hex"));


      const parsed = protoToClient.parsePacketBuffer("packet",data).data;

      const {name,params} = parsed;
      console.info("received packet", name, params);

      this.emit(name,params);
    });


    this.socket.on('end', () => {
      console.log('disconnected from server');
    });

  }

  write(packet_name, params) {
    const buffer = protoToServer.createPacketBuffer("packet",{
      name: packet_name,
      params
    });

    console.info("sending packet", packet_name, params);

    this.socket.write(buffer);
  }
}


module.exports = Client;