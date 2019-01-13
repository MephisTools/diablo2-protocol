const path = require('path')
const Item = require('./item')

const classificationMap = {}
classificationMap['Amazon Bow'] = Item.ClassificationType.amazon_bow
classificationMap['Amazon Javelin'] = Item.ClassificationType.amazon_javelin
classificationMap['Amazon Spear'] = Item.ClassificationType.amazon_spear
classificationMap['Amulet'] = Item.ClassificationType.amulet
classificationMap['Antidote Potion'] = Item.ClassificationType.antidote_potion
classificationMap['Armor'] = Item.ClassificationType.armor
classificationMap['Arrows'] = Item.ClassificationType.arrows
classificationMap['Assassin Katar'] = Item.ClassificationType.assassin_katar
classificationMap['Axe'] = Item.ClassificationType.axe
classificationMap['Barbarian Helm'] = Item.ClassificationType.barbarian_helm
classificationMap['Belt'] = Item.ClassificationType.belt
classificationMap['Body Part'] = Item.ClassificationType.body_part
classificationMap['Bolts'] = Item.ClassificationType.bolts
classificationMap['Boots'] = Item.ClassificationType.boots
classificationMap['Bow'] = Item.ClassificationType.bow
classificationMap['Circlet'] = Item.ClassificationType.circlet
classificationMap['Club'] = Item.ClassificationType.club
classificationMap['Crossbow'] = Item.ClassificationType.crossbow
classificationMap['Dagger'] = Item.ClassificationType.dagger
classificationMap['Druid Pelt'] = Item.ClassificationType.druid_pelt
classificationMap['Ear'] = Item.ClassificationType.ear
classificationMap['Elixir'] = Item.ClassificationType.elixir
classificationMap['Gem'] = Item.ClassificationType.gem
classificationMap['Gloves'] = Item.ClassificationType.gloves
classificationMap['Gold'] = Item.ClassificationType.gold
classificationMap['Grand Charm'] = Item.ClassificationType.grand_charm
classificationMap['Hammer'] = Item.ClassificationType.hammer
classificationMap['Health Potion'] = Item.ClassificationType.health_potion
classificationMap['Helm'] = Item.ClassificationType.helm
classificationMap['Herb'] = Item.ClassificationType.herb
classificationMap['Javelin'] = Item.ClassificationType.javelin
classificationMap['Jewel'] = Item.ClassificationType.jewel
classificationMap['Key'] = Item.ClassificationType.key
classificationMap['Large Charm'] = Item.ClassificationType.large_charm
classificationMap['Mace'] = Item.ClassificationType.mace
classificationMap['Mana Potion'] = Item.ClassificationType.mana_potion
classificationMap['Necromancer Shrunken Head'] = Item.ClassificationType.necromancer_shrunken_head
classificationMap['Paladin Shield'] = Item.ClassificationType.paladin_shield
classificationMap['Polearm'] = Item.ClassificationType.polearm
classificationMap['Quest Item'] = Item.ClassificationType.quest_item
classificationMap['Rejuvenation Potion'] = Item.ClassificationType.rejuvenation_potion
classificationMap['Ring'] = Item.ClassificationType.ring
classificationMap['Rune'] = Item.ClassificationType.rune
classificationMap['Scepter'] = Item.ClassificationType.scepter
classificationMap['Scroll'] = Item.ClassificationType.scroll
classificationMap['Shield'] = Item.ClassificationType.shield
classificationMap['Small Charm'] = Item.ClassificationType.small_charm
classificationMap['Sorceress Orb'] = Item.ClassificationType.sorceress_orb
classificationMap['Spear'] = Item.ClassificationType.spear
classificationMap['Staff'] = Item.ClassificationType.staff
classificationMap['Stamina Potion'] = Item.ClassificationType.stamina_potion
classificationMap['Sword'] = Item.ClassificationType.sword
classificationMap['Thawing Potion'] = Item.ClassificationType.thawing_potion
classificationMap['Throwing Axe'] = Item.ClassificationType.throwing_axe
classificationMap['Throwing Knife'] = Item.ClassificationType.throwing_knife
classificationMap['Throwing Potion'] = Item.ClassificationType.throwing_potion
classificationMap['Tome'] = Item.ClassificationType.tome
classificationMap['Torch'] = Item.ClassificationType.torch
classificationMap['Wand'] = Item.ClassificationType.wand

const fs = require('fs')

const file = fs.readFileSync(path.join(__dirname, '..', '..', 'data', 'game', 'item_data.txt'), 'utf8')
const lines = file.split('\n')
const items = lines.map(line => {
  const [name, code, classificationString, width, height, stackable, usable, throwable] = line.split('|')
  return { name, code, classification_string: classificationMap[classificationString], width, height, stackable, usable, throwable }
})

const itemByCode = items.reduce((acc, item) => {
  acc[item.code] = item
  return acc
}, {})

const file2 = fs.readFileSync(path.join(__dirname, '..', '..', 'data', 'game', 'item_properties.txt'), 'utf8')
const lines2 = file2.split('\n')
const itemsProperties = lines2.map(line => {
  const [statName, saveBits, saveParamBits, saveAdd] = line.split('|')
  return { statName, saveBits: parseInt(saveBits), saveParamBits: parseInt(saveParamBits), saveAdd: parseInt(saveAdd) }
})

module.exports = { items, itemByCode, itemsProperties }
