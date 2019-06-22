const ClientBnftp = require('../client/clientBnftp1.14')

function getMpq ({ host, port, mpqFiletime, mpqFilename, platformId, productId, clientToken, key }, cb) {
  const clientBnftp = new ClientBnftp()
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
      bannerFileExtension: 0
    })
  })

  clientBnftp.on('CHALLENGE', ({ serverToken }) => {
    clientBnftp.write('CHALLENGE', {
      startingPosition: 0,
      localFiletime: mpqFiletime,
      clientToken: clientToken,
      keyLength: key.keyLength,
      keyProductValue: key.keyProductValue,
      keyPublicValue: key.keyPublicValue,
      unknown: key.unknown,
      hashedKeyData: key.hashedKeyData,
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
