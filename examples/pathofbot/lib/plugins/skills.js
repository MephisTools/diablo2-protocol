function inject (bot) {
  bot.castSkillOnLocation = (x, y, skill) => {
    bot._client.write('D2GS_SWITCHSKILL', {
      skill: skill,
      unk1: 0,
      hand: 0, // 0 = right, 128 = left
      unknown: [255, 255, 255, 255, 255]
    })
    bot._client.write('D2GS_RIGHTSKILLONLOCATION', {
      xCoordinate: x,
      yCoordinate: y
    })
  }

  bot.castSkillOnEntity = (type, id, skill) => {
    bot.write('D2GS_SWITCHSKILL', {
      skill: skill,
      unk1: 0,
      hand: 0, // 0 = right, 128 = left
      unknown: [255, 255, 255, 255, 255]
    })
    bot._client.write('D2GS_RIGHTSKILLONENTITYEX3', {
      entityType: type,
      entityId: id
    })
  }

  // Handle leveling up skills
  bot.autoSkill = () => {
  }
}

module.exports = inject
