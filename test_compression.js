const {compress,decompress, getPacketSize} = require('./compression');

let output = compress(Buffer.from([0,0xa0]));
console.log('compressed : ' + output.toString("hex"));

let w = decompress(output);
console.log('decompressed : ' + w.toString("hex"));

console.log("size of packet :",getPacketSize(Buffer.from("067a092eef5c","hex")));

console.log("decompressed payload :",decompress(Buffer.from("7a092eef5c","hex")));


console.log("decompressed payload :",decompress(Buffer.from("2080","hex")));