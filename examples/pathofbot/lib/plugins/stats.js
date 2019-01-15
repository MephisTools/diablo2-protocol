function inject (bot) {
  // From the principle we join game full life / mana
  // TODO: heal to npc then store maxlife / maxmana
  // Why this is never called ?
  bot._client.on('D2GS_LIFEANDMANAUPDATE', ({ life, mana, stamina, x, y, unknown }) => {
    bot.say(`Life ${life}`)
    bot.say(`Mana ${mana}`)
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
      bot.usePotion('hp')
    }
    if (mana < bot.maxMana / 2) {
      bot.usePotion('mp')
    }
  })

  // Handle leveling up stats
  bot.autoStat = () => {
  }

  // This should handle when the bot have to exit when under a treshold of life to avoid dying
  bot.chicken = (treshold) => {
  }

  bot.usePotion = (type) => {
    // D2GS_USEITEM {"itemId":26,"xCoordinate":4671,"yCoordinate":4554}
    // D2GS_USEBELTITEM {"itemId":32,"unknown":0}
    const pot = bot.inventory.find(item => { return item.type.includes(type) })
    bot._client.write('D2GS_USEITEM', {
      itemId: pot.id,
      xCoordinate: pot.x,
      yCoordinate: pot.y
    })
    bot._client.write('D2GS_USEBELTITEM', {
      itemId: pot.id,
      unknown: 0
    })
  }
}
module.exports = inject
