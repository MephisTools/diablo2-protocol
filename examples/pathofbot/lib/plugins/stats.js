function inject (bot) {
  bot.maxLife = 0
  bot.maxMana = 0
  bot._client.on('D2GS_LIFEANDMANAUPDATE', ({ life, mana, stamina, x, y, unknown }) => {
    bot.say(`Life ${life}/${bot.maxLife}`)
    bot.say(`Mana ${mana}/${bot.maxMana}`)
    // Tmp thing since we're dont have a packet saying what is my max life / mana
    if (life > bot.maxLife) {
      bot.maxLife = life
    }
    if (mana > bot.maxMana) {
      bot.maxMana = mana
    }

    bot.life = life
    bot.mana = mana

    if (life < bot.maxLife / 2) {
      if (bot.usePotion('hp')) {
        bot.say('I used hp potion')
      }
    }
    if (mana < bot.maxMana / 2) {
      if (bot.usePotion('mp')) {
        bot.say('I used mp potion')
      }
    }
  })

  // Handle leveling up stats
  bot.autoStat = () => {
  }

  // This should handle when the bot have to exit when under a treshold of life to avoid dying
  bot.chicken = (treshold) => {
  }

  // Return true if successfully used potion, false if not (prob out of potion ?)
  bot.usePotion = (type) => {
    // D2GS_USEITEM {"itemId":26,"xCoordinate":4671,"yCoordinate":4554}
    // D2GS_USEBELTITEM {"itemId":32,"unknown":0}
    const pot = bot.inventory.find(item => { return item.type.includes(type) })
    if (pot === undefined) {
      return false
    }
    // Container 3 and 2 inventory and 136 ? maybe with PoD its different since inventory is bigger
    bot._client.write('D2GS_USEITEM', {
      itemId: pot.id,
      xCoordinate: pot.x,
      yCoordinate: pot.y
    })
    // Container 32 == belt
    bot._client.write('D2GS_USEBELTITEM', {
      itemId: pot.id,
      unknown: 0
    })
    return true
  }
}
module.exports = inject
