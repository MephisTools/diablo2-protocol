const diablo2Data = require('diablo2-data')('pod_1.13d')

const classificationMap = {}
classificationMap['Amazon Bow'] = diablo2Data.itemEnums.ClassificationType.amazon_bow
classificationMap['Amazon Javelin'] = diablo2Data.itemEnums.ClassificationType.amazon_javelin
classificationMap['Amazon Spear'] = diablo2Data.itemEnums.ClassificationType.amazon_spear
classificationMap['Amulet'] = diablo2Data.itemEnums.ClassificationType.amulet
classificationMap['Antidote Potion'] = diablo2Data.itemEnums.ClassificationType.antidote_potion
classificationMap['Armor'] = diablo2Data.itemEnums.ClassificationType.armor
classificationMap['Arrows'] = diablo2Data.itemEnums.ClassificationType.arrows
classificationMap['Assassin Katar'] = diablo2Data.itemEnums.ClassificationType.assassin_katar
classificationMap['Axe'] = diablo2Data.itemEnums.ClassificationType.axe
classificationMap['Barbarian Helm'] = diablo2Data.itemEnums.ClassificationType.barbarian_helm
classificationMap['Belt'] = diablo2Data.itemEnums.ClassificationType.belt
classificationMap['Body Part'] = diablo2Data.itemEnums.ClassificationType.body_part
classificationMap['Bolts'] = diablo2Data.itemEnums.ClassificationType.bolts
classificationMap['Boots'] = diablo2Data.itemEnums.ClassificationType.boots
classificationMap['Bow'] = diablo2Data.itemEnums.ClassificationType.bow
classificationMap['Circlet'] = diablo2Data.itemEnums.ClassificationType.circlet
classificationMap['Club'] = diablo2Data.itemEnums.ClassificationType.club
classificationMap['Crossbow'] = diablo2Data.itemEnums.ClassificationType.crossbow
classificationMap['Dagger'] = diablo2Data.itemEnums.ClassificationType.dagger
classificationMap['Druid Pelt'] = diablo2Data.itemEnums.ClassificationType.druid_pelt
classificationMap['Ear'] = diablo2Data.itemEnums.ClassificationType.ear
classificationMap['Elixir'] = diablo2Data.itemEnums.ClassificationType.elixir
classificationMap['Gem'] = diablo2Data.itemEnums.ClassificationType.gem
classificationMap['Gloves'] = diablo2Data.itemEnums.ClassificationType.gloves
classificationMap['Gold'] = diablo2Data.itemEnums.ClassificationType.gold
classificationMap['Grand Charm'] = diablo2Data.itemEnums.ClassificationType.grand_charm
classificationMap['Hammer'] = diablo2Data.itemEnums.ClassificationType.hammer
classificationMap['Health Potion'] = diablo2Data.itemEnums.ClassificationType.health_potion
classificationMap['Helm'] = diablo2Data.itemEnums.ClassificationType.helm
classificationMap['Herb'] = diablo2Data.itemEnums.ClassificationType.herb
classificationMap['Javelin'] = diablo2Data.itemEnums.ClassificationType.javelin
classificationMap['Jewel'] = diablo2Data.itemEnums.ClassificationType.jewel
classificationMap['Key'] = diablo2Data.itemEnums.ClassificationType.key
classificationMap['Large Charm'] = diablo2Data.itemEnums.ClassificationType.large_charm
classificationMap['Mace'] = diablo2Data.itemEnums.ClassificationType.mace
classificationMap['Mana Potion'] = diablo2Data.itemEnums.ClassificationType.mana_potion
classificationMap['Necromancer Shrunken Head'] = diablo2Data.itemEnums.ClassificationType.necromancer_shrunken_head
classificationMap['Paladin Shield'] = diablo2Data.itemEnums.ClassificationType.paladin_shield
classificationMap['Polearm'] = diablo2Data.itemEnums.ClassificationType.polearm
classificationMap['Quest diablo2Data.itemEnums'] = diablo2Data.itemEnums.ClassificationType.quest_item
classificationMap['Rejuvenation Potion'] = diablo2Data.itemEnums.ClassificationType.rejuvenation_potion
classificationMap['Ring'] = diablo2Data.itemEnums.ClassificationType.ring
classificationMap['Rune'] = diablo2Data.itemEnums.ClassificationType.rune
classificationMap['Scepter'] = diablo2Data.itemEnums.ClassificationType.scepter
classificationMap['Scroll'] = diablo2Data.itemEnums.ClassificationType.scroll
classificationMap['Shield'] = diablo2Data.itemEnums.ClassificationType.shield
classificationMap['Small Charm'] = diablo2Data.itemEnums.ClassificationType.small_charm
classificationMap['Sorceress Orb'] = diablo2Data.itemEnums.ClassificationType.sorceress_orb
classificationMap['Spear'] = diablo2Data.itemEnums.ClassificationType.spear
classificationMap['Staff'] = diablo2Data.itemEnums.ClassificationType.staff
classificationMap['Stamina Potion'] = diablo2Data.itemEnums.ClassificationType.stamina_potion
classificationMap['Sword'] = diablo2Data.itemEnums.ClassificationType.sword
classificationMap['Thawing Potion'] = diablo2Data.itemEnums.ClassificationType.thawing_potion
classificationMap['Throwing Axe'] = diablo2Data.itemEnums.ClassificationType.throwing_axe
classificationMap['Throwing Knife'] = diablo2Data.itemEnums.ClassificationType.throwing_knife
classificationMap['Throwing Potion'] = diablo2Data.itemEnums.ClassificationType.throwing_potion
classificationMap['Tome'] = diablo2Data.itemEnums.ClassificationType.tome
classificationMap['Torch'] = diablo2Data.itemEnums.ClassificationType.torch
classificationMap['Wand'] = diablo2Data.itemEnums.ClassificationType.wand

const items = diablo2Data.itemData.map(({ name, code, classificationString, width, height, stackable, usable, throwable }) => {
  return { name, code, classification_string: classificationMap[classificationString], width, height, stackable, usable, throwable }
})

const itemByCode = items.reduce((acc, item) => {
  acc[item.code] = item
  return acc
}, {})

const itemsProperties = diablo2Data.itemProperties.map(({ statName, saveBits, saveParamBits, saveAdd }) => {
  return { statName, saveBits: parseInt(saveBits), saveParamBits: parseInt(saveParamBits), saveAdd: parseInt(saveAdd) }
})

module.exports = { items, itemByCode, itemsProperties }
