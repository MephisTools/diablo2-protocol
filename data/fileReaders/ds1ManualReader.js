const { Sampler, Dt1, Tile } = require('./dt1ManualReader')
const fs = require('fs')

const dirLookup = [
  0x00, 0x01, 0x02, 0x01, 0x02, 0x03, 0x03, 0x05, 0x05, 0x06,
  0x06, 0x07, 0x07, 0x08, 0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E,
  0x0F, 0x10, 0x11, 0x12, 0x14
]

class Ds1 {
  static loadFile (basePath, filename) {
    const bytes = fs.readFileSync(basePath + '/' + filename)
    const ds1 = Ds1.loadBytes(basePath, bytes)
    ds1.filename = basePath + '/' + filename
    return ds1
  }

  static loadBytes (basePath, bytes) {
    let offset = 0
    const ds1 = new Ds1()
    ds1.version = bytes.readInt32LE(offset)
    offset += 4
    ds1.width = bytes.readInt32LE(offset) + 1
    offset += 4
    ds1.height = bytes.readInt32LE(offset) + 1
    offset += 4

    let act = 0
    if (ds1.version >= 8) {
      act = bytes.readInt32LE(offset)
      offset += 4
      act = Math.min(act, 4)
    }

    let tagType = 0
    if (ds1.version >= 10) {
      tagType = bytes.readInt32LE(offset)
      offset += 4
    }

    if (ds1.version >= 3) {
      // Palette.LoadPalette(act);
      let dt1Files
      ({ dt1Files, offset } = Ds1.readDependencies(bytes, offset))
      ds1.dt1Files = dt1Files
      ds1.tileSampler = new Sampler()
      ds1.dt1Files.forEach(dt1Filename => {
        const dt1 = Dt1.load(basePath, dt1Filename)
        ds1.tileSampler.add(dt1.tiles)
      })
    }

    if ((ds1.version >= 9) && (ds1.version <= 13)) {
      offset += 8
    }
    offset = Ds1.readLayers(ds1, bytes, offset, tagType)
    offset = Ds1.readObjects(ds1, bytes, offset, act)
    Ds1.readGroups(ds1, bytes, offset, tagType)

    return ds1
  }

  static readGroups (ds1, bytes, offset, tagType) {
    const hasGroups = ds1.version >= 12 && (tagType === 1 || tagType === 2)
    if (!hasGroups) {
      return
    }

    if (ds1.version >= 18) {
      bytes.readInt32LE(offset)
      offset += 4
    }
    const groupCount = bytes.readInt32LE(offset)
    offset += 4
    ds1.groups = new Array(groupCount)

    for (let i = 0; i < groupCount; i++) {
      const group = {}
      group.x = bytes.readInt32LE(offset)
      offset += 4
      group.y = bytes.readInt32LE(offset)
      offset += 4
      group.width = bytes.readInt32LE(offset)
      offset += 4
      group.height = bytes.readInt32LE(offset)
      offset += 4
      if (ds1.version >= 13) {
        bytes.readInt32LE(offset) // unknown
        offset += 4
      }
      ds1.groups.push(group)
    }
    return offset
  }

  static readObjects (ds1, bytes, offset, act) {
    if (ds1.version < 2) {
      return offset
    }
    const objectCount = bytes.readInt32LE(offset)
    offset += 4
    ds1.objects = new Array(objectCount)

    for (let i = 0; i < objectCount; i++) {
      const info = {}
      const type = bytes.readInt32LE(offset)
      offset += 4
      const id = bytes.readInt32LE(offset)
      offset += 4
      info.x = bytes.readInt32LE(offset)
      offset += 4
      info.y = bytes.readInt32LE(offset)
      offset += 4

      if (ds1.version > 5) {
        bytes.readInt32LE(offset) // flags
        offset += 4
      }

      // info.preset = SpawnPreset.Find(act, type, id)
      // ds1.objects[i] = info
    }
    return offset
  }

  static readLayers (ds1, bytes, offset, tagType) {
    let wallLayerCount = 1
    let floorLayerCount = 1
    let shadowLayerCount = 1
    let tagLayerCount = 0
    if (ds1.version >= 4) {
      wallLayerCount = bytes.readInt32LE(offset)
      offset += 4

      if (ds1.version >= 16) {
        floorLayerCount = bytes.readInt32LE(offset)
        offset += 4
      }
    } else {
      tagLayerCount = 1
    }
    if ((tagType === 1) || (tagType === 2)) {
      tagLayerCount = 1
    }
    ds1.floors = new Array(floorLayerCount)
    for (let i = 0; i < floorLayerCount; ++i) {
      ds1.floors[i] = new Array(ds1.width * ds1.height)
    }

    ds1.walls = new Array(wallLayerCount)
    for (let i = 0; i < wallLayerCount; ++i) {
      ds1.walls[i] = new Array(ds1.width * ds1.height)
    }
    if (ds1.version < 4) {
      offset = Ds1.readCells(ds1.walls[0], bytes, offset)
      offset = Ds1.readCells(ds1.floors[0], bytes, offset)
      offset = Ds1.readOrientations(ds1.walls[0], bytes, offset)
      offset += 4 * ds1.width * ds1.height // tag
      offset += 4 * ds1.width * ds1.height // shadow
    } else {
      for (let i = 0; i < wallLayerCount; i++) {
        offset = Ds1.readCells(ds1.walls[i], bytes, offset)
        offset = Ds1.readOrientations(ds1.walls[i], bytes, offset)
      }
      for (let i = 0; i < floorLayerCount; i++) {
        offset = Ds1.readCells(ds1.floors[i], bytes, offset)
      }
      if (shadowLayerCount !== 0) {
        offset += 4 * ds1.width * ds1.height // shadow
      }
      if (tagLayerCount !== 0) {
        offset += 4 * ds1.width * ds1.height // tag
      }
    }
    for (let w = 0; w < wallLayerCount; w++) {
      const cells = ds1.walls[w]
      let i = 0
      for (let y = 0; y < ds1.height; y++) {
        for (let x = 0; x < ds1.width; x++, i++) {
          const cell = cells[i]
          if (cell === undefined || cell.prop1 === 0) {
            continue
          }

          if (ds1.version < 7) {
            cell.orientation = dirLookup[cell.orientation]
          }

          cell.mainIndex = (cell.prop3 >> 4) + ((cell.prop4 & 0x03) << 4)
          cell.subIndex = cell.prop2
          cell.tileIndex = Tile.Index(cell.mainIndex, cell.subIndex, cell.orientation)

          cells[i] = cell
        }
      }
    }

    for (let f = 0; f < floorLayerCount; f++) {
      const cells = ds1.floors[f]
      for (let i = 0; i < cells.Length; i++) {
        const cell = cells[i]

        if (cell.prop1 === 0) {
          continue
        }

        cell.mainIndex = (cell.prop3 >> 4) + ((cell.prop4 & 0x03) << 4)
        cell.subIndex = cell.prop2
        cell.orientation = 0
        cell.tileIndex = Dt1.Tile.Index(cell.mainIndex, cell.subIndex, cell.orientation)

        cells[i] = cell
      }
    }
    return offset
  }

  static readCells (cells, bytes, offset) {
    for (let i = 0; i < cells.length; i++) {
      const cell = {}
      cells[i] = cell
      cell.prop1 = bytes.readInt8(offset)
      offset += 1
      cell.prop2 = bytes.readInt8(offset)
      offset += 1
      cell.prop3 = bytes.readInt8(offset)
      offset += 1
      cell.prop4 = bytes.readInt8(offset)
      offset += 1
    }
    return offset
  }

  static readOrientations (cells, bytes, offset) {
    for (let i = 0; i < cells.length; i++) {
      const cell = {}
      cells[i] = cell
      cell.orientation = bytes.readInt8(offset)
      offset += 4
    }
    return offset
  }

  static readDependencies (bytes, offset) {
    const fileCount = bytes.readInt32LE(offset)
    offset += 4
    const filenames = new Array(fileCount)

    for (let i = 0; i < fileCount; i++) {
      let dependency = ''
      let c
      while ((c = bytes.readInt8(offset++)) !== 0) {
        dependency += String.fromCharCode(c)
      }
      dependency = dependency.toLowerCase()
      dependency = dependency.replace('.tg1', '.dt1')
      dependency = dependency.replace('c:\\d2\\', '')
      dependency = dependency.replace('\\d2\\', '')
      dependency = dependency.replace(/\\/g, '/')
      filenames.push(dependency)
    }
    return { dt1Files: filenames, offset }
  }
}

if (process.argv.length !== 3) {
  console.log('Usage : node ds1ManualReader.js <basePath>')
  process.exit(1)
}

const basePath = process.argv[2]

console.log(JSON.stringify(Ds1.loadFile(basePath, 'data/global/tiles/act1/town/townew.ds1'), null, 2))
