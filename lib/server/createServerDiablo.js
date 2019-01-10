const ServerDiablo = require('./serverDiablo')

const createServerSid = require('./createServerSid')

function createServerDiablo (host) {
  const serverDiablo = new ServerDiablo()

  const serverSid = createServerSid(host)

  serverDiablo.setServerSid(serverSid)

  return serverDiablo
}

module.exports = createServerDiablo
