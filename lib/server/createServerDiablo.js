const ServerDiablo = require('./serverDiablo')

const createServerSid = require('./createServerSid')

const createServerMcp = require('./createServerMcp')

function createServerDiablo (host, externalHost) {
  const serverDiablo = new ServerDiablo()

  const serverSid = createServerSid(host, externalHost)

  serverDiablo.setServerSid(serverSid)

  const serverMcp = createServerMcp(host, externalHost)

  serverDiablo.setServerMcp(serverMcp)

  return serverDiablo
}

module.exports = createServerDiablo
