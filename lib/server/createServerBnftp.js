const ServerBnftp = require('./serverBnftp')

async function createServerBnftp (host) {
  const portBnftp = 6112
  const serverBnftp = new ServerBnftp()
  serverBnftp.listen(host, portBnftp)
  serverBnftp.on('connection', clientBnftp => {
    clientBnftp.on('packet', (packet) => console.log(packet))
  })
}

createServerBnftp('127.0.0.1')

module.exports = createServerBnftp
