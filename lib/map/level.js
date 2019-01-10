const Ds1 = require('./ds1ManualReader')
const csv = require('csvtojson')

if (process.argv.length !== 4) {
  console.log('Usage : node ds1ManualReader.js <basePath> <levelId>')
  process.exit(1)
}

const basePath = process.argv[2]
const levelId = process.argv[3]

async function levelPreset () {
  const levelPreset = await csv({
    delimiter: '\t'
  }).fromFile(basePath + '/data/global/excel/LvlPrest.txt')
  const levelPresetFiles = []
  /*
  for (let i = 1; i < 7; i++) {
    if (levelPreset[levelId]['File' + i] !== '0') {
      levelPresetFiles.push(Ds1.loadFile(basePath, 'data/global/tiles/' + levelPreset[levelId]['File' + i].toLowerCase()))
    }
  }
  levelPresetFiles.forEach(f => {
    // console.log(f['filename'])
  })
  */
  const levels = await csv({
    delimiter: '\t'
  }).fromFile(basePath + '/data/global/excel/Levels.txt')
  console.log(levelPreset[levelId])
  /*
  for (let i = 0; i < levelPreset.length; i++) {
    for (let j = 0; j < levels.length; j++) {
      if (levelPreset[levelId]['Name'] === levels[j]['Name']) {
        console.log('Found that shit', levelPreset[levelId], levels[j])
      }
    }
  }
  */
}

levelPreset()
