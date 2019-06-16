const { BitStream: BitReader } = require('bit-buffer')

function toArrayBuffer (buf) {
  const ab = new ArrayBuffer(buf.length)
  const view = new Uint8Array(ab)
  for (let i = 0; i < buf.length; ++i) {
    view[i] = buf[i]
  }
  return ab
}

BitReader.prototype.read = BitReader.prototype.readBits
BitReader.prototype.readBit = function () {
  return this.read(1)
}

const diablo2Data = require('diablo2-data')('pod_1.13d')
const dataReader = require('./dataReader')

BitReader.prototype.readString = function () {
  let output = ''
  for (let i = 0; i < 16; i++) {
    const c = this.read(7)
    if (c === 0) { return output }
    output += String.fromCharCode(c)
  }
  return output
}

// get basic info such as item
function genericInfo (reader, item) {
  const packet = reader.read(8)
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

  if (item.action === diablo2Data.itemEnums.Action.add_to_shop || item.action === diablo2Data.itemEnums.Action.remove_from_shop) {
    let container = (item.container)
    container |= 0x80
    if ((container & 1) !== 0) {
      container-- // remove first bit
      item.y += 8
    }
    item.container = container
  } else if (item.container === diablo2Data.itemEnums.ContainerType.unspecified) {
    if (item.directory === diablo2Data.itemEnums.DirectoryType.not_applicable) {
      // y is ignored for this container type, x tells you the index
      if (item.in_socket) { item.container = diablo2Data.itemEnums.ContainerType.item } else if (item.action === diablo2Data.itemEnums.Action.put_in_belt || item.action === diablo2Data.itemEnums.Action.remove_from_belt) {
        item.container = diablo2Data.itemEnums.ContainerType.belt
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
  for (let i = 0; i < 3; i++) { item.type += String.fromCharCode(reader.read(8)) }
  reader.read(8) // padding char

  const entry = dataReader.itemByCode[item.type]
  if (entry === undefined) {
    console.log('Failed to look up item in item data table')
    return true
  }

  item.name = entry.name
  item.width = entry.width
  item.height = entry.height
  item.throwable = entry.throwable
  item.stackable = entry.stackable
  item.usable = entry.usable

  item.is_armor = diablo2Data.itemEnums.isArmor(entry.classification_string)
  item.is_weapon = diablo2Data.itemEnums.isWeapon(entry.classification_string)

  if (item.type === 'gld') {
    item.is_gold = true
    const bigPile = reader.readBit()
    if (bigPile) item.amount = reader.read(32)
    else item.amount = reader.read(12)
    return true
  } else return false
}

function getLevelQuality (reader, item) {
  item.quality = diablo2Data.itemEnums.QualityType.normal
  if (item.simple_item || item.gambling) { return false }
  item.level = reader.read(7)
  item.quality = (reader.read(4))
  return true
}

function getGraphicInfo (reader, item) {
  item.has_graphic = reader.readBit()
  if (item.has_graphic) { item.graphic = reader.read(3) }

  item.has_colour = reader.readBit()
  if (item.has_colour) { item.colour = reader.read(11) }
}

function getIdentifiedInfo (reader, item) {
  try {
    if (item.identified) {
      switch (item.quality) {
        case diablo2Data.itemEnums.QualityType.inferior:
          item.prefix = reader.read(3)
          break
        case diablo2Data.itemEnums.QualityType.superior:
          item.superiority = (reader.read(3))
          break
        case diablo2Data.itemEnums.QualityType.magical:
          item.prefix = reader.read(11)
          item.suffix = reader.read(11)
          break

        case diablo2Data.itemEnums.QualityType.crafted:
        case diablo2Data.itemEnums.QualityType.rare:
          item.prefix = reader.read(8) - 156
          item.suffix = reader.read(8) - 1
          break

        case diablo2Data.itemEnums.QualityType.set:
          item.set_code = reader.read(12)
          break
        case diablo2Data.itemEnums.QualityType.unique: // standard of heroes exception?
          if (item.type !== 'std') { item.unique_code = reader.read(12) }
          break
      }
    }

    if (item.quality === diablo2Data.itemEnums.QualityType.rare || item.quality === diablo2Data.itemEnums.QualityType.crafted) {
      for (let i = 0; i < 3; i++) {
        if (reader.readBit()) { item.prefixes.Add(reader.read(11)) }
        if (reader.readBit()) { item.suffixes.Add(reader.read(11)) }
      }
    }

    if (item.rune_word) {
      item.runeword_id = reader.read(12)
      item.runeword_parameter = reader.read(4)
    }

    if (item.personalised) {
      item.personalised_name = reader.readString()
    }

    if (item.is_armor) { item.defense = reader.read(11) - 10 }

    if (item.throwable) {
      reader.read(9)
      reader.read(17)
    }

    if (item.type === '7cr') { reader.read(8) } else if (item.is_armor || item.is_weapon) {
      item.maximum_durability = reader.read(8)
      item.indestructible = ((item.maximum_durability === 0) ? 1 : 0)

      item.durability = reader.read(8)
      reader.readBit()
    }
    if (item.has_sockets) { item.sockets = reader.read(4) }

    if (item.stackable) {
      if (item.usable) { reader.read(5) }

      item.amount = reader.read(9)
    }

    if (!item.identified) { return item }

    if (item.quality === diablo2Data.itemEnums.QualityType.set) { item.set_mods = reader.read(5) }

    item.properties = []
    while (true) {
      const statId = reader.read(9)

      if (statId === 0x1ff) {
        break
      }

      const itemProperty = {}
      if (!processItemStat(statId, reader, itemProperty)) return item
      item.properties.push(itemProperty)
    }
    return item
  } catch (err) {
    console.log(err.message)
    return item
  }
}

function processItemStat (statId, reader, itemProperty) {
  const stat = diablo2Data.itemEnums.itemStatTypeReversed[statId]
  itemProperty.stat = stat
  const itemPropertyRaw = dataReader.itemsProperties[statId]
  if (itemPropertyRaw === undefined) {
    console.log('Invalid item stat ID: ', statId)
    return false
  }

  const { saveBits, saveParamBits, saveAdd } = itemPropertyRaw

  if (saveParamBits > 0) {
    switch (stat) {
      case 'reanimate':
      {
        itemProperty.monster = reader.read(saveParamBits)
        itemProperty.value = reader.read(saveBits)
        return true
      }

      case 'elemental_skills':
      {
        // wtf is element?
        reader.read(saveParamBits) // element
        itemProperty.value = reader.read(saveBits)
        return true
      }

      case 'class_skills':
      {
        itemProperty.character_class = reader.read(saveParamBits)
        itemProperty.value = reader.read(saveBits)
        return true
      }

      case 'aura':
      {
        itemProperty.skill = reader.read(saveParamBits)
        itemProperty.value = reader.read(saveBits)
        return true
      }

      case 'single_skill':
      case 'non_class_skill':
      {
        itemProperty.skill = reader.read(saveParamBits)
        itemProperty.value = reader.read(saveBits)
        return true
      }

      case 'charged':
      {
        itemProperty.level = reader.read(6)
        itemProperty.skill = reader.read(10)
        itemProperty.charges = reader.read(8)
        itemProperty.maximum_charges = reader.read(8)
        return true
      }

      case 'skill_on_death':
      case 'skill_on_hit':
      case 'skill_on_kill':
      case 'skill_on_level_up':
      case 'skill_on_striking':
      case 'skill_when_struck':
      {
        itemProperty.level = reader.read(6)
        itemProperty.skill = reader.read(10)
        itemProperty.skill_chance = reader.read(saveBits)
        return true
      }

      case 'skill_tab':
      {
        itemProperty.tab = reader.read(3)
        itemProperty.character_class = reader.read(3)
        reader.read(10) // unknown
        itemProperty.value = reader.read(saveBits)
        return true
      }

      default:
        throw new Error('This makes no fucking sense')
    }
  }

  switch (stat) {
    case 'defense_per_level':
    case 'enhanced_defense_per_level':
    case 'life_per_level':
    case 'mana_per_level':
    case 'maximum_damage_per_level':
    case 'maximum_enhanced_damage_per_level':
    case 'strength_per_level':
    case 'dexterity_per_level':
    case 'energy_per_level':
    case 'vitality_per_level':
    case 'attack_rating_per_level':
    case 'bonus_to_attack_rating_per_level':
    case 'maximum_cold_damage_per_level':
    case 'maximum_fire_damage_per_level':
    case 'maximum_lightning_damage_per_level':
    case 'maximum_poison_damage_per_level':
    case 'cold_resistance_per_level':
    case 'fire_resistance_per_level':
    case 'lightning_resistance_per_level':
    case 'poison_resistance_per_level':
    case 'cold_absorption_per_level':
    case 'fire_absorption_per_level':
    case 'lightning_absorption_per_level':
    case 'poison_absorption_per_level':
    case 'thorns_per_level':
    case 'extra_gold_per_level':
    case 'better_chance_of_getting_magic_item_per_level':
    case 'stamina_regeneration_per_level':
    case 'stamina_per_level':
    case 'damage_to_demons_per_level':
    case 'damage_to_undead_per_level':
    case 'attack_rating_against_demons_per_level':
    case 'attack_rating_against_undead_per_level':
    case 'crushing_blow_per_level':
    case 'open_wounds_per_level':
    case 'kick_damage_per_level':
    case 'deadly_strike_per_level':
    case 'find_gems_per_level':
    {
      itemProperty.per_level = reader.read(saveBits)
      return true
    }
  }

  switch (statId) {
    case 'enhanced_maximum_damage':
    case 'enhanced_minimum_damage':
    {
      itemProperty.minimum = reader.read(saveBits)
      itemProperty.maximum = reader.read(saveBits)
      return true
    }

    case 'minimum_fire_damage':
    {
      itemProperty.minimum = reader.read(saveBits)
      itemProperty.maximum = reader.read(dataReader.itemsProperties[diablo2Data.itemEnums.itemStatType.maximum_fire_damage].saveBits)
      return true
    }

    case 'minimum_lightning_damage':
    {
      itemProperty.minimum = reader.read(saveBits)
      itemProperty.maximum = reader.read(dataReader.itemsProperties[diablo2Data.itemEnums.itemStatType.maximum_lightning_damage].saveBits)
      return true
    }

    case 'minimum_magical_damage':
    {
      itemProperty.minimum = reader.read(saveBits)
      itemProperty.maximum = reader.read(dataReader.itemsProperties[diablo2Data.itemEnums.itemStatType.maximum_magical_damage].saveBits)
      return true
    }

    case 'minimum_cold_damage':
    {
      itemProperty.minimum = reader.read(saveBits)
      itemProperty.maximum = reader.read(dataReader.itemsProperties[diablo2Data.itemEnums.itemStatType.maximum_cold_damage].saveBits)
      itemProperty.length = reader.read(dataReader.itemsProperties[diablo2Data.itemEnums.itemStatType.cold_damage_length].saveBits)
      return true
    }

    case 'minimum_poison_damage':
    {
      itemProperty.minimum = reader.read(saveBits)
      itemProperty.maximum = reader.read(dataReader.itemsProperties[diablo2Data.itemEnums.itemStatType.maximum_poison_damage].saveBits)
      itemProperty.length = reader.read(dataReader.itemsProperties[diablo2Data.itemEnums.itemStatType.poison_damage_length].saveBits)
      return true
    }

    case 'repairs_durability':
    case 'replenishes_quantity':
    {
      itemProperty.value = reader.read(saveBits)
      return true
    }

    default:
    {
      itemProperty.value = reader.read(saveBits) - saveAdd
    }
  }
  return true
}

function parse (packet) {
  const item = {}
  try {
    const reader = new BitReader(toArrayBuffer(packet))
    genericInfo(reader, item)
    statusInfo(reader, item)
    getLocation(reader, item)
    if (earInfo(reader, item)) return item
    if (getItemType(reader, item)) return item
    if (!getLevelQuality(reader, item)) return item
    getGraphicInfo(reader, item)
    getIdentifiedInfo(reader, item)
  } catch (err) {
    console.log(err.message)
    return item
  }
  return item
}

module.exports = parse
