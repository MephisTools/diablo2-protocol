const ProtoDef = require("protodef").ProtoDef;

const protocol = require('./data/protocol');

const proto = new ProtoDef();
proto.addProtocol(protocol,["toServer"]);


console.log(proto.parsePacketBuffer("packet",Buffer.from(`FF 50 33 00 00 00 00 00 36 38 58 49 50 58
					32 44 0D 00 00 00 53 55 6E 65 C0 A8 01 23 C4 FF
					FF FF 0C 04 00 00 09 04 00 00 46 52 41 00 46 72
					61 6E 63 65 00`.replace(/[ \n\r\t]/g,""),"hex")));