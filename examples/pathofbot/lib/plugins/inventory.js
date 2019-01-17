function inject (bot) {
  // Idk what name should it has
  // When joining a game you get D2GS_ITEMACTIONOWNED for each items you have equipped,
  // D2GS_ITEMACTIONWORLD for each item in your inventory / stash
  // Save our items in arrays
  bot.inventory = []
  bot._client.on('D2GS_ITEMACTIONOWNED', ({ id, type, name, x, y, width, height, container }) => {
    bot.inventory.push({ id: id, type: type, name: name, x: x, y: y, width: width, height: height, container: container })
  })
  bot._client.on('D2GS_ITEMACTIONWORLD', ({ id, type, name, x, y, width, height, container }) => {
    bot.inventory.push({ id: id, type: type, name: name, x: x, y: y, width: width, height: height, container: container })
  })

  // We stop this behaviour after having saved all our inventory
  setTimeout(() => {
    bot._client.removeAllListeners('D2GS_ITEMACTIONOWNED')
    bot._client.removeAllListeners('D2GS_ITEMACTIONWORLD')
  }, 5000)

  bot.pickupEveryItems = () => {
    bot._client.on('D2GS_ITEMACTIONWORLD', ({ id, type, name, x, y, width, height, container }) => {
      bot._client.write('D2GS_RUNTOENTITY', {
        entityType: 4,
        entityId: id // 2nd element seems to be the id
      })
      bot._client.write('D2GS_PICKUPITEM', { // Possible action IDs: 0x00 - Move item to inventory 0x01 - Move item to cursor buffer
        unitType: 4,
        unitId: id
      })
      bot._client.once('D2GS_REMOVEOBJECT', ({ unitType, unitId }) => { // Maybe its not optimal ? (not sure it's me who picked it)
        bot.inventory.push({ id: id, type: type, name: name, x: x, y: y, width: width, height: height, container: container })
      })
      /*
        D2GS_PICKUPITEM {"unitType":4,"unitId":52,"actionId":0}
        d2gsToClient :  D2GS_REMOVEOBJECT {"unitType":4,"unitId":52}
        d2gsToClient :  D2GS_ITEMACTIONWORLD {"entityType":4,"unknown2":[5,52,0,0,0,16,0,128,0,101,0,82,242,6,199,6,130,128,32,16,128,192,127]}
        */
    })

    // toclient D2GS_ITEMACTIONWORLD {"unknown1":0,"unknown2":[16,86,0,0,0,16,32,160,0,101,204,101,2,8,227,140,141,12,196,0,0]}
    // toserver D22GS_RUNTOENTITY {"entityType":4,"entityId":86}
    // toserver D2GS_PICKUPITEM {"unitType":4,"unitId":86,"actionId":0}
  }

  // TODO: handle pickit
  bot.pickit = (config) => {
  }

  // Drop a potion of health ? health : mana
  bot.dropPot = (health) => {
    try {
      const potion = bot.inventory.find(item => { return item.type.includes(health ? 'hp' : 'mp') })
      console.log('found potion', potion)
      // if (potion['container'] === 2) { // 2 = inventory
      bot._client.write('D2GS_DROPITEM', {
        itemId: potion.id
      })
      // }
      // if (potion['container'] === 0) { // 0 = belt
      bot._client.write('D2GS_REMOVEBELTITEM', {
        itemId: potion.id
      })
      // }
    } catch (error) {
      console.log(error)
    }
  }

  // Do i have this item ?
  bot.hasItem = (name) => {
    try {
      bot.say(bot.inventory.find(item => item.name.includes(name)) ? `I have ${name}` : `I don't have ${name}`)
    } catch (error) {
      console.log(error)
    }
  }
}

module.exports = inject
