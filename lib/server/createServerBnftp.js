const ServerBnftp = require('./serverBnftp')

function createServerBnftp (host) {
  const portBnftp = 6112
  const serverBnftp = new ServerBnftp()
  serverBnftp.listen(host, portBnftp)
  serverBnftp.on('connection', clientBnftp => {
    clientBnftp.on('packet', (packet) => console.log(packet))
    clientBnftp.on('FILE_TRANSFER_PROTOCOL', ({ requestLength, protocolVersion, platformId, productId, bannerId,
      bannerFileExtension, startPositonInFile, filetimeOfLocalFile, fileName }) => {
      clientBnftp.write('FILE_TRANSFER_PROTOCOL', {
        'headerLength': requestLength,
        'type': 101,
        'fileSize': 0,
        'bannersId': bannerId,
        'bannerFileExtension': bannerFileExtension,
        'remoteFiletime': [30698013, 3812817152],
        'fileName': fileName,
        'fileData': { 'type': 'Buffer', 'data': [] }
      })
    })
  })
  return serverBnftp
}

module.exports = createServerBnftp
