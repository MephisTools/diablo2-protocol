const createClientDiablo = require('./lib/client/createClientDiablo')
const { createSplitter } = require('./lib/utils/splitter')
const { decompress, compress, getPacketSize } = require('./lib/utils/compression')
const d2gsReader = require('./lib/utils/d2gsSpecialReader')
const getHash = require('./lib/utils/getHash')
const createServerDiablo = require('./lib/server/createServerDiablo')
const ClientSid = require('./lib/client/clientSid')
const ClientMcp = require('./lib/client/clientMcp')
const ClientD2gs = require('./lib/client/clientD2gs')
const ClientDiablo = require('./lib/client/clientDiablo')
const ServerDiablo = require('./lib/server/serverDiablo')
const ServerD2gs = require('./lib/server/serverD2gs')

const createServerSid = require('./lib/server/createServerSid')
const createServerMcp = require('./lib/server/createServerMcp')
const itemParser = require('./lib/utils/itemParser')
const bitfieldLE = require('./lib/utils/bitfieldLE')
const { defaultVersion, supportedVersions } = require('./version')
const cdKey = require('./lib/utils/cdkey')
const cdKey26 = require('./lib/utils/cdkey26')
const checkRevision = require('./lib/utils/checkRevision')

const protocol = supportedVersions.reduce((acc, version) => {
  acc[version] = {
    sid: require(`./data/${version}/sid`),
    bnftp: require(`./data/${version}/bnftp`),
    mcp: require(`./data/${version}/mcp`),
    d2gs: require(`./data/${version}/d2gs`)
  }
  return acc
}, {})

module.exports = {
  protocol,
  createClientDiablo,
  createSplitter,
  decompress,
  compress,
  getPacketSize,
  d2gsReader,
  getHash,
  createServerDiablo,
  createServerSid,
  createServerMcp,
  ClientSid,
  ClientMcp,
  ClientD2gs,
  ClientDiablo,
  ServerD2gs,
  ServerDiablo,
  itemParser,
  bitfieldLE,
  supportedVersions,
  defaultVersion,
  cdKey,
  cdKey26,
  checkRevision
}
