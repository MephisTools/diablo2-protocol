const net = require('net');

const ProtoDef = require("protodef").ProtoDef;
const bnftp = require('./data/bnftp');
const EventEmitter = require('events').EventEmitter;

const bnftpToServer = new ProtoDef();
bnftpToServer.addProtocol(bnftp,["toServer"]);


const bnftpToClient = new ProtoDef();
bnftpToClient.addProtocol(bnftp,["toClient"]);

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
      console.log("received that hex", data.toString("hex"));
      const parsed = bnftpToClient.parsePacketBuffer("FILE_TRANSFER_PROTOCOL",data);

      this.emit("packet",parsed);
      console.info("received packet", parsed);

      
    });
    this.socket.on('end', () => {
      console.log('disconnected from server');
    });

  }

  write(params) {
    bnftpToServer.createPacketBuffer("FILE_TRANSFER_PROTOCOL",params);
    console.info("sending packet", params);

    this.socket.write(buffer);
  }
}


module.exports = Client;