function inject (bot) {
  bot.master = null
  bot.playerList = []
  bot.follow = false

  bot._client.on('D2GS_GAMECHAT', ({ charName, message }) => {
    if (message === '.master') {
      if (bot.master === null) {
        bot.say(`${charName} is now master`)
        bot.master = charName
      } else {
        bot.say(`${bot.master} is already master`)
      }
    }

    if (message === '.follow' && charName === bot.master) {
      bot.follow = !bot.follow
      bot.say(`Follow  ${bot.follow ? 'on' : 'off'}`)

      if (!bot.follow) {
        bot._client.removeAllListeners('D2GS_PLAYERMOVE')
      } else {
        bot._client.on('D2GS_PLAYERMOVE', ({ targetX, targetY }) => {
          bot.run(targetX, targetY)
        })
      }
    }

    if (message === '.autokill' && charName === bot.master) {
      bot.autokill = !bot.autokill
      bot.say(`Autokill  ${bot.autokill ? 'on' : 'off'}`)
      if (!bot.autokill) {
        bot._client.removeAllListeners('D2GS_NPCMOVE')
        bot._client.removeAllListeners('D2GS_NPCMOVETOTARGET')
        // bot.removeAllListeners('D2GS_NPCATTACK')
      } else {
        // Doesn't work if target too far
        bot._client.on('D2GS_NPCMOVE', ({ unitId, type, x, y }) => {
          let a = (x - bot.x)
          let b = (y - bot.y)

          if (Math.sqrt(a * a + b * b) < 10) { // Euclidean distance
            bot.target = unitId
            // bot.run(x, y)
            // bot.castSkillOnEntity(type, unitId, 1)
            bot.castSkillOnLocation(x, y, 0)
          }
          // bot.castSkill(unitId, type, 49)
        })
        bot._client.on('D2GS_NPCMOVETOTARGET', ({ unitId, type, x, y }) => {
          let a = (x - bot.x)
          let b = (y - bot.y)

          if (Math.sqrt(a * a + b * b) < 10) { // Euclidean distance
            // bot.run(x, y)
            // bot.castSkillOnEntity(type, unitId, 1)
            bot.castSkillOnLocation(x, y, 0)
          }
          // bot.castSkill(unitId, type, 49)
        })
        /*
        bot._client.on('D2GS_NPCATTACK', ({ x, y }) => {
          bot.castSkill(x, y, 49)
        })
        */
      }
    }

    if (message === '.pickup' && charName === bot.master) {
      bot.pickup = !bot.pickup
      bot.say(`pickup  ${bot.pickup ? 'on' : 'off'}`)
      if (!bot.pickup) {
        bot._client.removeAllListeners('D2GS_ITEMACTIONWORLD')
      } else {
        bot.pickupItems()
      }
    }

    if (message === '.warp' && charName === bot.master) {
      bot.runToWarp()
    }

    if (message.startsWith('.item') && charName === bot.master && message.split(' ').length > 1) {
      bot.hasItem(message.split(' ')[1])
    }

    if (message.startsWith('.pot') && charName === bot.master && message.split(' ').length > 1) {
      bot.dropPot(message.split(' ')[1] === 'hp')
    }

    if (message.startsWith('.wp') && charName === bot.master && message.split(' ').length > 1) {
      bot.takeWaypoint(message.split(' ')[1])
    }
    /*
    // Doesnt work :D
    if (message === '.yolo' && charName === bot.master) {
      bot._client.write('D2GS_INTERACTWITHENTITY', {
        entityType: 2,
        entityId: 49
      })
      bot._client.on('D2GS_WAYPOINTMENU', () => {
        bot._client.write('D2GS_WAYPOINT', {
          waypointId: 49,
          unknown: 0,
          levelNumber: 129
        })
      })
    }
    */
  })
}

module.exports = inject
