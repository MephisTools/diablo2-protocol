const createClientDiablo = require('./lib/createClientDiablo')
const mcpProtocol = require('./data/mcp')
const sidProtocol = require('./data/sid')
const bnftpProtocol = require('./data/bnftp')
const { createSplitter } = require('./lib/splitter')
const { decompress, compress, getPacketSize } = require('./lib/compression')
const d2gsProtocol = require('./data/d2gs')
const d2gsReader = require('./lib/d2gsSpecialReader')
const getHash = require('./lib/getHash')
const createServerDiablo = require('./lib/server/createServerDiablo')

module.exports = {
  createClientDiablo,
  mcpProtocol,
  sidProtocol,
  bnftpProtocol,
  createSplitter,
  decompress,
  compress,
  getPacketSize,
  d2gsProtocol,
  d2gsReader,
  getHash,
  createServerDiablo
}
