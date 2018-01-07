const net = require('net');
const client = net.createConnection({ port: 6112, host:'176.31.38.228' }, () => {
  //'connect' listener
  console.log('connected to server!');
  //client.write('world!\r\n');

  client.write(Buffer.from("01","hex")); // Initialises a normal logon conversation

  client.write(Buffer.from(`FF 50 33 00 00 00 00 00 36 38 58 49 50 58
					32 44 0D 00 00 00 53 55 6E 65 C0 A8 01 23 C4 FF
					FF FF 0C 04 00 00 09 04 00 00 46 52 41 00 46 72
					61 6E 63 65 00`.replace(/[ \n\r\t]/g,""),"hex")); // http://www.bnetdocs.org/?op=packet&pid=279 SID_AUTH_INFO
});
client.on('data', (data) => {
  console.log(data.toString());
  client.end();
});
client.on('end', () => {
  console.log('disconnected from server');
});