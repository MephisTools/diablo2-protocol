const csv = require('csvtojson')
const Ds1 = require('./ds1ManualReader')

if (process.argv.length !== 4) {
  console.log('Usage : node ds1ManualReader.js <basePath> <levelId>')
  process.exit(1)
}

const basePath = process.argv[2]
const levelId = process.argv[3]

async function levelPreset () {
  const levelsPreset = await csv({
    delimiter: '\t'
  }).fromFile(basePath + '/data/global/excel/lvlprest.txt')
  const levelsPresetFiles = []
  for (let i = 1; i < 7; i++) {
    if (levelsPreset[levelId]['File' + i] !== '0') {
      levelsPresetFiles.push(Ds1.loadFile(basePath, 'data/global/tiles/' + levelsPreset[levelId]['File' + i].toLowerCase()))
    }
  }
  levelsPresetFiles.forEach(f => {
    console.log(f)
  })

  /* const levels = */ await csv({
    delimiter: '\t'
  }).fromFile(basePath + '/data/global/excel/levels.txt')
  /*
  console.log('~~ Preset areas ~~')
  levels.forEach(level => {
    levelsPreset.forEach(levelPreset => {
      if (level['DrlgType'] === '2') {
        if (level['Id'] === levelPreset['LevelId']) {
          console.log(level['Id'])
        }
      }
    })
  })
  */
  // console.log(levelsPresetFiles[levelId])
}

levelPreset()
