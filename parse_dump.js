const ProtoDef = require("protodef").ProtoDef;

const protocol = require('./data/protocol');

const protoToServer = new ProtoDef();
protoToServer.addProtocol(protocol,["toServer"]);

/*
console.log(protoToServer.parsePacketBuffer("packet",Buffer.from(`FF 50 33 00 00 00 00 00 36 38 58 49 50 58
					32 44 0D 00 00 00 53 55 6E 65 C0 A8 01 23 C4 FF
					FF FF 0C 04 00 00 09 04 00 00 46 52 41 00 46 72
					61 6E 63 65 00`.replace(/[ \n\r\t]/g,""),"hex")));

*/

const bnftpProto = require('./data/bnftp');

const bnftp = new ProtoDef();
bnftp.addProtocol(bnftpProto,["toServer"]);

/*

console.log(bnftp.parsePacketBuffer("FILE_TRANSFER_PROTOCOL",Buffer.from(`2f 00 00 01 36 38 58 49  56 44 32 44 00 00 00 00 
   00 00 00 00 00 00 00 00  00 31 ef 00 70 5f c7 01 
   76 65 72 2d 49 58 38 36  2d 31 2e 6d 70 71 00`.replace(/[ \n\r\t]/g,""),"hex")));


console.log(JSON.stringify(protoToServer.parsePacketBuffer("packet",Buffer.from(`ff 33 1e 00 04 00 00 80 00 00 00 00 62 6e 73 65
   72 76 65 72 2d 44 32 44 56 2e 69 6e 69 00`.replace(/[ \n\r\t]/g,""),"hex")).data,null,2));

   */


console.log(JSON.stringify(protoToServer.parsePacketBuffer("packet",Buffer.from(`ff 3a 29 00 3e 1e 16 01 d7 43 54 5a d1 bf c8 8a
   8a 81 11 09 e0 0f b3 b0 98 be 47 1b 5f 5f 5e 54
   75 72 75 6b 75 62 61 6c 00`.replace(/[ \n\r\t]/g,""),"hex")).data,null,2));
