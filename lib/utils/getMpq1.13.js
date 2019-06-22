const ClientBnftp = require('../client/clientBnftp1.13')

function getMpq ({ host, port, mpqFiletime, mpqFilename, platformId, productId, version }, cb) {
  const clientBnftp = new ClientBnftp(version)
  clientBnftp.connect(host, port)

  clientBnftp.on('connect', () => {
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
    // process.exit(22)
    cb(null, data)
  })

  return clientBnftp
}

module.exports = getMpq
