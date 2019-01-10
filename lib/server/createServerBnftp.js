const ServerBnftp = require('./serverBnftp')

function createServerBnftp (host) {
  const portBnftp = 6112
  const serverBnftp = new ServerBnftp()
  serverBnftp.listen(host, portBnftp)
  serverBnftp.on('connection', clientBnftp => {
    clientBnftp.on('packet', (packet) => console.log(packet))
  })
  return serverBnftp
}

module.exports = createServerBnftp
