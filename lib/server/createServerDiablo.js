const ServerDiablo = require('./serverDiablo')

const createServerSid = require('./createServerSid')

const createServerMcp = require('./createServerMcp')

function createServerDiablo (host) {
  const serverDiablo = new ServerDiablo()

  const serverSid = createServerSid(host)

  serverDiablo.setServerSid(serverSid)

  // const serverMcp = createServerMcp(host)

  // serverDiablo.setServerMcp(serverMcp)

  return serverDiablo
}

module.exports = createServerDiablo
