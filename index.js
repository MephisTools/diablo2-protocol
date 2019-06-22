const createClientDiablo = require('./lib/client/createClientDiablo')
const { createSplitter } = require('./lib/utils/splitter')
const { decompress, compress, getPacketSize } = require('./lib/utils/compression')
const d2gsReader = require('./lib/utils/d2gsSpecialReader')
const getHash = require('./lib/utils/getHash')
const createServerDiablo = require('./lib/server/createServerDiablo')
const ServerDiablo = require('./lib/server/serverDiablo')
const createServerSid = require('./lib/server/createServerSid')
const createServerMcp = require('./lib/server/createServerMcp')
const ServerD2gs = require('./lib/server/serverD2gs')
const itemParser = require('./lib/utils/itemParser')
const bitfieldLE = require('./lib/utils/bitfieldLE')
const { defaultVersion, supportedVersions } = require('./version')

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
  ServerD2gs,
  ServerDiablo,
  itemParser,
  bitfieldLE,
  supportedVersions,
  defaultVersion
}
