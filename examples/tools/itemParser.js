const BitReader = require('bitset-reader')
const Item = require('./item')
const dataReader = require('./dataReader')

BitReader.prototype.readString = function () {
  let output = ''
  for (let i = 0; i < 16; i++) {
    let letter = String.fromCharCode(this.read(7))
    if (letter === 0) { return output }
    output += letter
  }
  return output
}

// get basic info such as item
function genericInfo (reader, item) {
  const packet = reader.read(8)
  console.log(packet)
  item.action = reader.read(8)
  item.category = reader.read(8)
  reader.read(8) // validSize
  item.id = reader.read(32)
  if (packet === 0x9d) {
    reader.read(40)
  }
}

// get info for basic status info
function statusInfo (reader, item) {
  item.equipped = reader.readBit()
  reader.readBit()
  reader.readBit()
  item.in_socket = reader.readBit()
  item.identified = reader.readBit()
  reader.readBit()
  item.switched_in = reader.readBit()
  item.switched_out = reader.readBit()
  item.broken = reader.readBit()
  reader.readBit()
  item.potion = reader.readBit()
  item.has_sockets = reader.readBit()
  reader.readBit()
  item.in_store = reader.readBit()
  item.not_in_a_socket = reader.readBit()
  reader.readBit()
  item.ear = reader.readBit()
  item.start_item = reader.readBit()
  reader.readBit()
  reader.readBit()
  reader.readBit()
  item.simple_item = reader.readBit()
  item.ethereal = reader.readBit()
  reader.readBit()
  item.personalised = reader.readBit()
  item.gambling = reader.readBit()
  item.rune_word = reader.readBit()
  reader.read(5)
  item.version = reader.read(8)
  reader.read(2)
}

function getLocation (reader, item) {
  const destination = reader.read(3)
  item.ground = (destination === 0x03)

  if (item.ground) {
    item.x = reader.read(16)
    item.y = reader.read(16)
  } else {
    item.directory = reader.read(4)
    item.x = reader.read(4)
    item.y = reader.read(3)
    item.container = (reader.read(4))
  }
  item.unspecified_directory = false

  if (item.action === Item.Action.add_to_shop || item.action === Item.Action.remove_from_shop) {
    let container = (item.container)
    container |= 0x80
    if ((container & 1) !== 0) {
      container-- // remove first bit
      item.y += 8
    }
    item.container = container
  } else if (item.container === Item.ContainerType.unspecified) {
    if (item.directory === Item.DirectoryType.not_applicable) {
      // y is ignored for this container type, x tells you the index
      if (item.in_socket) { item.container = Item.ContainerType.item } else if (item.action === Item.Action.put_in_belt || item.action === Item.Action.remove_from_belt) {
        item.container = Item.ContainerType.belt
        item.y = item.x / 4
        item.x %= 4
      }
    } else { item.unspecified_directory = true }
  }
}

function earInfo (reader, item) {
  if (item.ear) {
    reader.read(3)
    item.ear_level = reader.read(7)
    item.ear_name = reader.readString()

    return true
  } else { return false }
}

// gets the 3 letter item code
function getItemType (reader, item) {
  item.type = ''
  for (let i = 0; i < 4; i++) { item.type += String.fromCharCode(reader.read(8)) }

  const entry = dataReader.items[item.type]
  if (entry === undefined) {
    console.log('Failed to look up item in item data table')
    return true
  }

  item.name = entry.Name
  item.width = entry.Width
  item.height = entry.Height

  item.is_armor = Item.isArmor(entry.classification_string)
  item.is_weapon = Item.isWeapon(entry.classification_string)

  if (item.type === 'gld') {
    item.is_gold = true
    const bigPile = reader.readBit()
    if (bigPile) item.amount = reader.read(32)
    else item.amount = reader.read(12)
    return true
  } else return false
}

function getLevelQuality (reader, item) {
  item.quality = Item.QualityType.normal
  if (item.simple_item || item.gambling) { return false }
  item.level = reader.read(7)
  item.quality = (Item.QualityType)(reader.read(4))
  return true
}

function getGraphicInfo (reader, item) {
  item.has_graphic = reader.readBit()
  if (item.has_graphic) { item.graphic = reader.read(3) }

  item.has_colour = reader.readBit()
  if (item.has_colour) { item.colour = reader.read(11) }
}

function getIdentifiedInfo (reader, item) {
  if (item.identified) {
    switch (item.quality) {
      case Item.QualityType.inferior:
        item.prefix = reader.read(3)
        break
      case Item.QualityType.superior:
        item.superiority = (Item.SuperiorItemClassType)(reader.read(3))
        break
      case Item.QualityType.magical:
        item.prefix = reader.read(11)
        item.suffix = reader.read(11)
        break

      case Item.QualityType.crafted:
      case Item.QualityType.rare:
        item.prefix = reader.read(8) - 156
        item.suffix = reader.read(8) - 1
        break

      case Item.QualityType.set:
        item.set_code = reader.read(12)
        break
      case Item.QualityType.unique: // standard of heroes exception?
        if (item.type !== 'std') { item.unique_code = reader.read(12) }
        break
    }
  }

  if (item.quality === Item.QualityType.rare || item.quality === Item.QualityType.crafted) {
    for (let i = 0; i < 3; i++) {
      if (reader.readBit()) { item.prefixes.Add(reader.read(11)) }
      if (reader.readBit()) { item.suffixes.Add(reader.read(11)) }
    }
  }

  if (item.rune_word) {
    item.runeword_id = reader.read(12)
    item.runeword_parameter = reader.read(4)
    // std::cout << "runeword_id: " << item.runeword_id << ", parameter: " << item.runeword_parameter << std::endl
  }

  if (item.personalised) {
    item.personalised_name = reader.readString()
  }

  if (item.is_armor) { item.defense = reader.read(11) - 10 }

  if (item.type === '7cr') { reader.read(8) } else if (item.is_armor || item.is_weapon) {
    item.maximum_durability = reader.read(8)
    item.indestructible = ((item.maximum_durability === 0) ? 1 : 0)

    item.durability = reader.read(8)
    reader.readBit()
  }
  if (item.has_sockets) { item.sockets = reader.read(4) }
}

function parse (packet) {
  const item = {}
  const reader = new BitReader(packet)
  genericInfo(reader, item)
  statusInfo(reader, item)
  getLocation(reader, item)
  if (earInfo(reader, item)) return item
  if (getItemType(reader, item)) return item
  if (!getLevelQuality(reader, item)) return item
  getGraphicInfo(reader, item)
  getIdentifiedInfo(reader, item)
  return item
}

module.exports = parse
