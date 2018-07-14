const ClientBNFTP = require('./clientBNFTP');


function getMpq(host, port, mpqFiletime, mpqFilename, platformId, productId, cb) {
  const clientBNFTP = new ClientBNFTP({host, port});

  clientBNFTP.connect();

  clientBNFTP.on('connect', () => {
    //'connect' listener
    console.log('connected to server!');
    //client.write('world!\r\n');
    clientBNFTP.socket.write(Buffer.from("02","hex")); // This initialises a BNFTP file download conversation

    console.log("Downloading mpq : ",mpqFilename);

    clientBNFTP.write('FILE_TRANSFER_PROTOCOL',{
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


  clientBNFTP.on('FILE_TRANSFER_PROTOCOL', (data) => {
    console.log(data);
    cb(null, data);

  });
}

module.exports = getMpq;
