const fs = require('fs')

class BlockFlags {
  constructor () {
    this.walk = 1 // both player and mercenary
    this.light = 2 // and line of sight
    this.jump = 4
    this.playerWalk = 8
    this.lightOnly = 32 // but not line of sigh
  }
}

class Sampler {
  constructor () {
    this.tiles = {}
    this.rarities = {}
    this.dt1Count = 0
  }

  add (newTiles) {
    newTiles.forEach(tile => {
      let list = this.tiles[tile.index]
      list = list === undefined ? null : list
      if (list === null) {
        list = []
        this.tiles[tile.index] = list
      }

      if (this.dt1Count === 0) {
        list.splice(0, 0, tile)
      } else {
        list.push(tile)
      }

      if (!(tile.index in this.rarities)) {
        this.rarities[tile.index] = tile.rarity
      } else {
        this.rarities[tile.index] += tile.rarity
      }
    })
    this.dt1Count += 1
  }

  sample (index) {
    let tileList = []
    let tile = null
    if (!this.tiles[index]) {
      tile = {}
      return { result: false, tile }
    } else {
      tileList = this.tiles[index]
    }

    const raritySum = this.rarities[index]
    if (raritySum === 0) {
      tile = tileList[0]
    } else {
      let randomValue = Math.floor((Math.random() * raritySum)) // Return a random number between 0 and raritySum
      for (let i = 0; i < tileList.Count; ++i) {
        if (randomValue < tileList[i].rarity) {
          tile = tileList[i]
          return { result: true, tile }
        }
        randomValue -= tileList[i].rarity
      }

      tile = tileList[0]
    }

    return { result: true, tile }
  }
}

class Tile {
  read (bytes, offset) {
    this.direction = bytes.readInt32LE()
    offset += 4
    this.roofHeight = bytes.readInt16LE()
    offset += 2
    this.soundIndex = bytes.readInt8()
    offset += 1
    this.animated = bytes.readInt8()
    offset += 1
    this.height = bytes.readInt32LE()
    offset += 4
    this.width = bytes.readInt32LE()
    offset += 4
    bytes.readInt8(4) // zeros
    offset += 4
    this.orientation = bytes.readInt32LE()
    offset += 4
    this.mainIndex = bytes.readInt32LE()
    offset += 4
    this.subIndex = bytes.readInt32LE()
    offset += 4
    this.rarity = bytes.readInt32LE()
    offset += 4
    bytes.readInt8(4) // unknown
    offset += 4
    this.flags = bytes.readInt8(25) // Left to Right, and Bottom to Up
    offset += 25
    bytes.readInt8(7) // unused
    offset += 7
    this.this.blockHeaderPointer = bytes.readInt32LE()
    offset += 4
    this.blockDatasLength = bytes.readInt32LE()
    offset += 4
    this.blockCount = bytes.readInt32LE()
    offset += 4
    bytes.readInt8(12) // zeros
    offset += 12
    this.index = Tile.index(this.mainIndex, this.subIndex, this.orientation)

    return offset
  }

  static index (mainIndex, subIndex, orientation) {
    return (((mainIndex << 6) + subIndex) << 5) + orientation
  }
}

class Dt1 {
  static readTiles (dt1, bytes, offset) {
    const tileCount = bytes.readInt32LE()
    offset += 4
    bytes.readInt32LE() //  Pointer in file to Tile Headers (= 276)
    offset += 4
    dt1.tiles = {}

    for (let i = 0; i < tileCount; ++i) {
      dt1.tiles[i].read(bytes, offset)
    }

    for (let i = 0; i < tileCount; ++i) {
      var tile = dt1.tiles[i]

      if (tile.width === 0 || tile.height === 0) {
        continue
      }

      if ((tile.orientation === 0 || tile.orientation === 15) && tile.height !== 0) {
        // floor or roof
        tile.height = -79
      }

      dt1.tiles[i] = tile

      offset += tile.blockHeaderPointer
      for (let block = 0; block < tile.blockCount; ++block) {
        bytes.readInt16LE() // x
        offset += 2
        bytes.readInt16LE() // y
        offset += 2
        bytes.readInt8(2) // zeros
        offset += 2
        bytes.readInt8() // gridX
        offset += 1
        bytes.readInt8() // gridY
        offset += 1
        bytes.readInt16LE() // format
        offset += 2
        bytes.readInt32LE() // length
        offset += 4
        bytes.readInt8(2) // zeros
        offset += 2
        bytes.readInt32LE() // fileOffset
        offset += 4
      }
    }
  }

  static load (filename, mpq = true) {
    const lowerFilename = filename.toLower()
    let offset = 0
    const bytes = fs.readFileSync(lowerFilename)
    const dt1 = {}
    dt1.filename = filename

    const version1 = bytes.readInt32LE()
    const version2 = bytes.readInt32LE()
    if (version1 !== 7 || version2 !== 6) {
      return dt1
    }

    offset += 260
    Dt1.readTiles(dt1, bytes, offset)
    return dt1
  }
}
