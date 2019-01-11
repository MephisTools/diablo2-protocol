const ServerDiablo = require('./serverDiablo')

const createServerSid = require('./createServerSid')

const createServerMcp = require('./createServerMcp')

const createServerBnftp = require('./createServerBnftp')

function createServerDiablo (host) {
  const serverDiablo = new ServerDiablo()

  const serverSid = createServerSid(host)

  serverDiablo.setServerSid(serverSid)

  serverSid.on('end', () => {
    console.log('Start bnftp')
    const serverBnftp = createServerBnftp(host)
    serverDiablo.setServerBnftp(serverBnftp)
  })
  // const serverMcp = createServerMcp(host)

  // serverDiablo.setServerMcp(serverMcp)

  return serverDiablo
}

module.exports = createServerDiablo
