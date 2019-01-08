const Ds1 = require('./ds1ManualReader')
const csv = require('csvtojson')

if (process.argv.length !== 4) {
  console.log('Usage : node ds1ManualReader.js <basePath> <levelId>')
  process.exit(1)
}

const basePath = process.argv[2]
const levelId = process.argv[3]

async function levelPreset () {
  const json = await csv({
    delimiter: '\t'
  }).fromFile(basePath + '/data/global/excel/LvlPrest.txt')
  const files = []
  for (let i = 1; i < 7; i++) {
    if (json[levelId]['File' + i] !== '0') {
      files.push(Ds1.loadFile(basePath, 'data/global/tiles/' + json[levelId]['File' + i].toLowerCase()))
    }
  }
  files.forEach(f => {
    console.log(f['filename'])
  })
}

levelPreset()
