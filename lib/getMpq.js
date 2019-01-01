const ClientBnftp = require('./clientBnftp')

function getMpq (host, port, mpqFiletime, mpqFilename, platformId, productId, cb) {
  const clientBnftp = new ClientBnftp({ host, port })

  clientBnftp.connect()

  clientBnftp.on('connect', () => {
    // 'connect' listener
    console.log('connected to server!')
    // client.write('world!\r\n');
    clientBnftp.socket.write(Buffer.from('02', 'hex')) // This initialises a BNFTP file download conversation

    console.log('Downloading mpq : ', mpqFilename)

    clientBnftp.write('FILE_TRANSFER_PROTOCOL', {
      requestLength: 47,
      protocolVersion: 256,
      platformId: platformId,
      productId: productId,
      bannerId: 0,
      bannerFileExtension: 0,
      startPositionInFile: 0,
      filetimeOfLocalFile: mpqFiletime,
      fileName: mpqFilename
    })
  })

  clientBnftp.on('FILE_TRANSFER_PROTOCOL', (data) => {
    console.log(data)
    cb(null, data)
  })

  return clientBnftp
}

module.exports = getMpq
