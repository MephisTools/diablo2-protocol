const Client2 = require('./client2');


function getMpq(host, port, mpqFiletime, mpqFilename, platformId, productId, cb) {
  const client2 = new Client2({host, port});

  client2.connect();

  client2.on('connect', () => {
    //'connect' listener
    console.log('connected to server!');
    //client.write('world!\r\n');
    client2.socket.write(Buffer.from("02","hex")); // This initialises a BNFTP file download conversation

    console.log("Downloading mpq : ",mpqFilename);

    client2.write('FILE_TRANSFER_PROTOCOL',{
      requestLength:47,
      protocolVersion:256,
      platformId:platformId,
      productId:productId,
      bannerId:0,
      bannerFileExtension:0,
      startPositionInFile:0,
      filetimeOfLocalFile:mpqFiletime,
      fileName : mpqFilename
    });
  });


  client2.on('FILE_TRANSFER_PROTOCOL', (data) => {
    console.log(data);
    cb(null, data);

  });
}

module.exports = getMpq;