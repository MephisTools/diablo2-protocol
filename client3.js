const net = require('net');

const ProtoDef = require("protodef").ProtoDef;
const Parser = require("protodef").Parser;
const mcp = require('./data/mcp');
const EventEmitter = require('events').EventEmitter;

const mcpToServer = new ProtoDef();
mcpToServer.addProtocol(mcp,["toServer"]);


const mcpToClient = new ProtoDef();
mcpToClient.addProtocol(mcp,["toClient"]);

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
            const parsed = protoToClient.parsePacketBuffer("packet",data).data;

            const {name,params} = parsed;
            console.info("received packet", name, params);

            this.emit(name,params);
        });

        this.socket.pipe(parser);

        this.socket.on('end', () => {
            console.log('disconnected from mcp server');
        });

    }

    write(name,params) {
        const buffer = protoToServer.createPacketBuffer("packet",{
            size: 0,
            name: packet_name,
            params
        });

        console.info("sending packet", packet_name, params);
        buffer.writeInt32LE(buffer.length,2);

        this.socket.write(buffer);
    }
}


module.exports = Client;