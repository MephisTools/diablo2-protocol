const createServerDiablo = require('..').createServerDiablo

if (process.argv.length !== 3) {
  console.log('Usage : node bot.js <externalHost>')
  process.exit(1)
}

const serverDiablo = createServerDiablo('127.0.0.1', process.argv[2])

serverDiablo.on('connection', client => {
})
