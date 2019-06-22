const createServerDiablo = require('..').createServerDiablo
const { supportedVersions, defaultVersion } = require('..')

if (process.argv.length !== 4) {
  console.log('Usage : node bot.js <externalHost> <version>')
  process.exit(1)
}

// If the version correspond to a supported version else use default
const version = supportedVersions.find(v => v === process.argv[9]) ? process.argv[9] : defaultVersion

const serverDiablo = createServerDiablo('127.0.0.1', process.argv[2], version)

serverDiablo.on('connection', client => {
})
