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

/*
console.log(JSON.stringify(protoToServer.parsePacketBuffer("packet",Buffer.from(`ff 3a 29 00 3e 1e 16 01 d7 43 54 5a d1 bf c8 8a
   8a 81 11 09 e0 0f b3 b0 98 be 47 1b 5f 5f 5e 54
   75 72 75 6b 75 62 61 6c 00`.replace(/[ \n\r\t]/g,""),"hex")).data,null,2));
*/
/*
console.log(JSON.stringify(protoToServer.parsePacketBuffer("packet",Buffer.from(`1a 00 03 02 00 00 20 00 00 01 63 08 41 73 61 00
   5a 64 64 00 67 73 20 32 31 00`.replace(/[ \n\r\t]/g,""),"hex")).data,null,2));


console.log(JSON.stringify(protoToServer.parsePacketBuffer("packet",Buffer.from(` ff 1c 23 00 01 00 00 00 00 00 00 00 00 00 00 00
   00 00 00 00 00 00 00 00 54 65 73 74 00 54 65 73
   74 00 00`.replace(/[ \n\r\t]/g,""),"hex")).data,null,2));
*/


const d2gsProto = require('./data/d2gs');

const d2gs = new ProtoDef();
d2gs.addProtocol(d2gsProto,["toServer"]);
/*
console.log(JSON.stringify(d2gs.parsePacketBuffer("packet",Buffer.from(`68 A5 81 60 5A 01 00 01 0D 00 00 00 50 CC
5D ED B6 19 A5 91 00 55 72 75 6B 75 62 61 6C 00
12 05 4B 00 00 00 00`.replace(/[ \n\r\t]/g,""),"hex")).data,null,2));
*/

console.log(JSON.stringify(d2gs.parsePacketBuffer("packet",Buffer.from(`   68 a1 f3 68 5a 0f 00 01 0d 00 00 00 50 cc 5d ed
   b6 19 a5 91 00 55 72 75 6b 75 62 61 6c 00 af 6f
   4b 00 00 00 00`.replace(/[ \n\r\t]/g,""),"hex")).data,null,2));






const mcpProto = require('./data/mcp');

const mcp = new ProtoDef();
mcp.addProtocol(mcpProto,["toServer"]);

/*
console.log(JSON.stringify(mcp.parsePacketBuffer("packet",Buffer.from(`ff0f870004000000000000001000000
0000000000df0adba0df0adba5461726b686e617262
2a5461726b686e61726200596f757220667269656e64205461726b686e617262
2068617320656e7465726564206120446961626c6f204949
`.replace(/[ \n\r\t]/g,""),"hex")).data,null,2));
*/


