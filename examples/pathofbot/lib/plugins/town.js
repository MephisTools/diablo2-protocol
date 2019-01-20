const fs = require('fs')
const path = require('path')

function inject (bot) {
  const NpcActionEnum = Object.freeze({ 'heal': 1, 'repair': 2, 'gamble': 3, 'quest': 4, 'merc': 5 }) // Maybe add more actions
  bot.npcShop = [] // Contains the items inside the npc shop
  bot.npcs = [] // Contains the informations about this game npcs
  bot.npcsNames = fs.readFileSync(path.join(__dirname, '../../../../data/game/monster_names.txt'), 'utf8').split('\n')
  bot.areaNames = fs.readFileSync(path.join(__dirname, '../../../../data/game/areas.txt'), 'utf8').split('\n')

  // Maybe we could also listen to the npcmove stuff but honestly they don't go too far
  // We can reach them easy with runtoentity
  bot._client.on('D2GS_ASSIGNNPC', ({ unitId, unitCode, x, y, unitLife, stateInfo }) => {
    // If we ain't already got the npc in the list
    if (bot.npcs.findIndex(npc => npc.code === unitCode) === -1) {
      bot.npcs.push({ id: unitId, code: unitCode, x: x, y: y })
      bot.say(`Detected a new npc id:${unitId},unitCode:${unitCode},x:${x},y:${y}`)
    }
  })

  // This method will check if i have to to go npc trader / healer / repairer / hire / gambler
  // If yes go to npc and buy stuffs
  bot.checkTown = () => {
    // Work in progress, not tested / working
    // Check heal ?
    const potions = bot.checkPotions()
    const tomes = bot.checkTomes(true)
    const repair = bot.checkRepair()
    const merc = bot.checkMerc()
    console.log(potions, tomes, repair, merc)

    if (potions.hp > 0 || potions.mp > 0 || tomes > 0) {
      const npcId = bot.reachNpc(NpcActionEnum.heal) // TODO: think how to handle act 2 (only act which healer doesn't sell tomes / scrolls)
      // Buy stuff
      bot.buyPotions(npcId, potions.hp, potions.mp)
      bot.cancelNpc(npcId)
    }

    if (repair.length > 0) {
      const npcId = bot.reachNpc(NpcActionEnum.repair)
      // Repair
      bot.cancelNpc(npcId)
    }

    /*
    When buying scroll of portal (into a tome)
    D2GS_UPDATEITEMSKILL {"unknown":24,"unitId":1,"skill":220,"amount":16}
    16 corresponds to the quantity of scrolls in the tome

    */
  }

  bot.tradeNpc = (npcId) => {
    bot._client.write('D2GS_INTERACTWITHENTITY', { // Maybe the npc is boring us with quest stuff, check that case ??
      entityType: 1,
      entityId: npcId
    })
    bot._client.write('D2GS_NPCINIT', {
      entityType: 1,
      entityId: npcId
    })
    bot._client.write('D2GS_NPCTRADE', {
      entityType: 1,
      entityId: npcId,
      unknown: 0
    })
  }

  bot.cancelNpc = (npcId, callback) => {
    bot._client.write('D2GS_NPCCANCEL', {
      entityType: 1,
      entityId: npcId
    })
    bot._client.removeListener('D2GS_ITEMACTIONWORLD', callbackShop)
    bot.npcShop = [] // Atm we don't care about storing npc shops after trading done, whats the point ?
  }

  // We will check if the belt is filled as we like
  // Belts in diablo 2 have different sizes
  // For example 4 x, 2 y, another belt 4 x, 4 y (only y change), max is 5 i think ?
  bot.checkPotions = () => {
    // const belt = bot.inventory.find(item => { return item['directory'] === '8' }) // 8 is belt
    // Find data file saying which belt can have that much y ....
    let healthPotions = 0 // Here we have to init with maximum y of the belt we have equipped
    let manaPotions = 0
    bot.inventory.forEach(item => {
      if (item.type.include('hp')) {
        healthPotions--
      }
      if (item.type.include('mp')) {
        healthPotions--
      }
    })
    return { hp: healthPotions, mp: manaPotions }
  }

  // This is not done, how do we know what quantity do we have in the tome ?
  // true = portal, false = identify
  bot.checkTomes = (portal) => {
    let tome = 0
    bot.inventory.forEach(item => {
      if (item.type.include(portal ? 'tbk' : 'ibk')) {
        tome++
      }
    })
    return tome
    // Actually this is returning how many books we have (not rly useful)
    // We should return how many scrolls we need
  }

  bot.checkRepair = (treshold) => {
    let toRepair = []

    bot.inventory.forEach(item => {
      // If the equipped item durability is under a treshold, this item has to be repaired
      if (item['equipped'] && item['durability'] < item['maximum_durability'] / 2) {
        toRepair.push(item)
      }
    })

    return toRepair
  }

  bot.checkMerc = () => {
  }

  // Buy potions until belt is filled, maybe we don't care if its in belt or inventory since bot is using packets?
  bot.buyPotions = (npcId, hp, mp) => {
    /*
      d2gsToServer : D2GS_NPCBUY {"npcId":12,"itemId":93,"bufferType":0,"cost":27}
      d2gsToClient :  D2GS_NPCTRANSACTION {"tradeType":4,"result":0,"unknown":256,"merchandiseId":95,"goldInInventory":0}
      d2gsToClient :  D2GS_ITEMACTIONWORLD {"action":14,"category":20,"id":95,"equipped":0,"in_socket":0,"identified":1,"switched_in":0,"switched_out":0,"broken":0,"potion":0,"has_sockets":0,"in_store":0,"not_in_a_socket":0,"ear":0,"start_item":0,"simple_item":1,"ethereal":0,"personalised":0,"gambling":0,"rune_word":0,"version":101,"ground":false,"directory":0,"x":0,"y":2,"container":32,"unspecified_directory":false,"type":"hp1","name":"Minor Healing Potion","width":"1","height":"1","throwable":"0","stackable":"0","usable":"1","is_armor":false,"is_weapon":false,"quality":2}
      d2gsToClient :  D2GS_RELATOR1 {"param1":0,"unityId":1,"param2":0}
      d2gsToClient :  D2GS_RELATOR2 {"param1":0,"unityId":1,"param2":0}
      d2gsToClient :  D2GS_SETDWORDATTR {"attribute":15,"amount":1090902}
      d2gsToClient :  D2GS_SETBYTEATTR {"attribute":14,"amount":0}
    */
    return new Promise(resolve => {
      if (bot.gold > 10000) { // TODO: config treshold
        while (hp < 4) {
          bot._client.once('D2GS_ITEMACTIONWORLD', ({ id, type, name, x, y, width, height, container }) => {
            bot.inventory.push({ id: id, type: type, name: name, x: x, y: y, width: width, height: height, container: container })
          })
          bot._client.once('D2GS_NPCTRANSACTION', ({ tradeType, result, unknown, merchandiseId, goldInInventory }) => {
            if (result === 0) {
              hp++
            } else {
              console.log('Exception: Failed transaction')
            }
          })
          bot._client.write('D2GS_NPCBUY', {
            npcId: npcId,
            itemId: bot.npcShop.find(item => { return item.type.include('hp') }).id,
            bufferType: 0,
            cost: 0
          })
        }

        while (mp < 4) {
          bot._client.once('D2GS_ITEMACTIONWORLD', ({ id, type, name, x, y, width, height, container }) => {
            bot.inventory.push({ id: id, type: type, name: name, x: x, y: y, width: width, height: height, container: container })
          })
          bot._client.once('D2GS_NPCTRANSACTION', ({ tradeType, result, unknown, merchandiseId, goldInInventory }) => {
            if (result === 0) {
              mp++
            } else {
              console.log('Exception: Failed transaction')
            }
          })
          bot._client.write('D2GS_NPCBUY', {
            npcId: npcId,
            itemId: bot.npcShop.find(item => { return item.type.include('mp') }).id,
            bufferType: 0,
            cost: 0
          })
        }
      } else {
        bot.say(`I can't afford potions`)
      }
      resolve()
    })
  }

  // Check if i have enough scroll in my books (don't buy identify stuff if we use cain anyway)
  // Optmized version wouldn't close then reopen between buys like potions then tome ...
  bot.fillTome = (npcId) => {
    if (bot.gold > 1000) { // TODO: config treshold
      // Do buy tome
    }
  }

  // This will return which npc i have to go to do an action (repair, heal ...) at a specific act
  // Because npcs are differents every act
  // In diablo 2, all npcs have different roles in every acts
  bot.whichNpc = (action, areaName) => {
    let id
    switch (areaName) {
      case 'LEVEL_ROGUE_ENCAMPMENT':
        if (action === NpcActionEnum.heal) {
          id = bot.npcsNames.findIndex(npcName => npcName.includes('Akara'))
        }
        if (action === NpcActionEnum.repair) {
          id = bot.npcsNames.findIndex(npcName => npcName.includes('Charsi'))
        }
        break
      case 'LEVEL_LUT_GHOLEIN':
        if (action === NpcActionEnum.heal || action === NpcActionEnum.repair) {
          id = bot.npcsNames.findIndex(npcName => npcName.includes('Fara'))
        }
        break
      case 'LEVEL_KURAST_DOCKTOWN':
        if (action === NpcActionEnum.heal) {
          id = bot.npcsNames.findIndex(npcName => npcName.includes('Ormus'))
        }
        if (action === NpcActionEnum.repair) {
          id = bot.npcsNames.findIndex(npcName => npcName.includes('Hratli'))
        }
        break
      case 'LEVEL_THE_PANDEMONIUM_FORTRESS':
        if (action === NpcActionEnum.heal) {
          id = bot.npcsNames.findIndex(npcName => npcName.includes('Jamella'))
        }
        if (action === NpcActionEnum.repair) {
          id = bot.npcsNames.findIndex(npcName => npcName.includes('Halbu'))
        }
        break
      case 'LEVEL_HARROGATH':
        if (action === NpcActionEnum.heal) {
          id = bot.npcsNames.findIndex(npcName => npcName.includes('Malah'))
        }
        if (action === NpcActionEnum.repair) {
          id = bot.npcsNames.findIndex(npcName => npcName.includes('Larzuk'))
        }
        break
    }
    return id
  }

  bot.identify = (cain = true) => {
    if (cain) {
      const npc = bot.npcs.find(npc => npc.code === bot.npcsNames.findIndex(npcName => npcName === 'Cain'))
      bot.moveTo(false, npc.x, npc.y)
    } // Else ??
  }

  const callbackShop = (data) => {
    bot.npcShop.push(data)
  }

  bot.reachNpc = (action) => {
    try {
      const areaName = bot.areaNames.find(areaName => { return parseInt(areaName.split(',')[1]) === bot.area })
      bot.say(`bot.reachNpc areaName ${areaName.split(',')[0]}`)
      const npc = bot.npcs.find(npc => npc.code === bot.whichNpc(action, areaName.split(',')[0]))
      bot.say(`bot.reachNpc npc ${npc}`)

      // Store the list of items of the npc
      bot._client.on('D2GS_ITEMACTIONWORLD', (callbackShop))

      bot.moveTo(false, npc.id)
      // bot.tradeNpc(npc.id)
      return npc.id
    } catch (error) {
      console.log(`bot.reachNpc ${error}`)
    }
  }

  // Put everything in the stash except the required stuff (set a parameter for things we wanna always keep such as book scroll, charms ...)
  // Put extra gold in stash ...
  bot.stash = (id) => {
    /*
      d2gsToServer : D2GS_RUNTOENTITY {"entityType":2,"entityId":17}
      d2gsToServer : D2GS_RUNTOENTITY {"entityType":2,"entityId":17}
      d2gsToServer : D2GS_INTERACTWITHENTITY {"entityType":2,"entityId":17}
      d2gsToClient :  D2GS_TRADEACTION {"requestType":16}
    */
    bot._client.write('D2GS_RUNTOENTITY', {
      entityType: 2,
      entityId: id // Maybe we could find automatically depending on the act we're at
    })
    bot._client.write('D2GS_INTERACTWITHENTITY', {
      entityType: 2,
      entityId: id // Maybe we could find automatically depending on the act we're at
    })
    bot._client.write('D2GS_TRADEACTION', {
      requestType: 16 // ???
    })
  }
}

module.exports = inject
