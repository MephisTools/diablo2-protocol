const ServerDiablo = require('./serverDiablo')

const createServerSid = require('./createServerSid')

const createServerMcp = require('./createServerMcp')

const createServerD2gs = require('./createServerD2gs')

function createServerDiablo (host, externalHost) {
  const serverDiablo = new ServerDiablo()

  const serverSid = createServerSid(host, externalHost)

  serverDiablo.setServerSid(serverSid)

  const serverMcp = createServerMcp(host, externalHost)

  serverDiablo.setServerMcp(serverMcp)

  const serverD2gs = createServerD2gs(host, externalHost)

  serverDiablo.setServerD2gs(serverD2gs)

  return serverDiablo
}

module.exports = createServerDiablo
