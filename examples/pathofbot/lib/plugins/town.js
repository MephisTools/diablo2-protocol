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
    // if (bot.npcs.find(npc => npc.id !== unitId)) {
    bot.npcs.push({ id: unitId, code: unitCode, x: x, y: y })
    // }
  })

  // This method will check if i have to to go npc trader / healer / repairer / hire / gambler
  // If yes go to npc and buy stuffs
  bot.needToGoToNpc = () => {
    // Work in progress, not tested / working
    const potions = bot.checkPotions()
    const tomes = bot.checkTomes()
    const repair = bot.checkRepair()
    const merc = bot.checkMerc()
    console.log(potions, tomes, repair, merc)
  }

  bot.tradeNpc = (npcId) => {
    /*
      d2gsToServer : D2GS_RUNTOENTITY {"entityType":1,"entityId":12}
      d2gsToServer : D2GS_RUNTOENTITY {"entityType":1,"entityId":12}
      d2gsToServer : D2GS_INTERACTWITHENTITY {"entityType":1,"entityId":12}
      d2gsToClient :  D2GS_NPCINFO {"unitType":1,"unitId":12,"unknown":[4,0,2,0,71,0,2,0,93,0,2,0,155,0,2,0,138,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]}
      d2gsToClient :  D2GS_GAMEQUESTINFO {"unknown":[0,0,0,0,0,128,0,0,0,160,0,0,0,128,0,0,0,32,0,0,0,0,0,160,0,160,0,128,0,128,0,0,0,0,0,0,0,128,0,0,0,0,0,160,0,160,0,0,0,0,0,0,0,128,0,0,0,0,0,0,0,0,0,0,0,160,0,0,0,0,0,128,0,0,0,0,0,0,0,128,0,128,0,0,0,0,0,0,0,0,0,0,0,0,0,0]}
      d2gsToClient :  D2GS_QUESTINFO {"unknown":[1,12,0,0,0,0,1,0,12,0,18,128,8,0,25,144,20,0,25,16,1,0,1,0,0,0,57,28,5,16,129,17,5,16,37,0,1,0,0,0,0,0,1,0,0,0,0,0,9,0,1,10,1,0,1,0,4,0,1,2,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,33,0,0,0,8,0,0,0,9,17,85,20,0,0,0,0,0,0,0,0,0,0,0,0,0,0]}
      d2gsToClient :  D2GS_NPCSTOP {"unitId":12,"x":5726,"y":5791,"unitLife":128}
      d2gsToClient :  D2GS_WALKVERIFY {"stamina":605,"x":5724,"unknown1":0,"y":5793,"unknown2":1532}
      d2gsToServer : D2GS_NPCINIT {"entityType":1,"entityId":12}
      d2gsToClient :  D2GS_SETDWORDATTR {"attribute":6,"amount":252288}
      d2gsToClient :  D2GS_PLAYSOUND {"unitType":1,"unitId":12,"sound":10}
      d2gsToServer : D2GS_PING {"tickCount":33790171,"delay":35,"wardenResponse":0}
      d2gsToClient :  D2GS_PONG {"tickCount":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]}
      d2gsToClient :  D2GS_NPCSTOP {"unitId":12,"x":5726,"y":5791,"unitLife":128}
      d2gsToClient :  D2GS_LIFEANDMANAUPDATE {"life":985,"mana":612,"stamina":605,"x":5724,"y":5793,"unknown":766}
      d2gsToServer : D2GS_NPCTRADE {"tradeType":1,"npcId":12,"unknown":0}
    */
    // Find a path to it
    bot._client.write('D2GS_RUNTOENTITY', {
      entityType: 1,
      entityId: npcId
    })
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
    // Store the list of items of the npc
    bot._client.on('D2GS_ITEMACTIONWORLD', ({ id, type, name, x, y, width, height, container }) => {
      bot.npcShop.push({ npcId: npcId, id: id, type: type, name: name, x: x, y: y, width: width, height: height, container: container })
    })
  }

  bot.checkPotions = () => {
    let healthPotions = 0
    let manaPotions = 0
    bot.inventory.forEach(item => {
      if (item.type.include('hp')) {
        healthPotions++
      }
      if (item.type.include('mp')) {
        healthPotions++
      }
    })
    return { hp: healthPotions, mp: manaPotions }
  }

  // Check if i have enough pots in my belt (have a config where we say what kind of potions we want the bot to always have)
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
  bot.whichNpc = (action, areaName) => {
    let id
    switch (areaName) {
      case 'LEVEL_ROGUE_ENCAMPMENT':
        if (action === NpcActionEnum.heal) {
          id = bot.npcsNames.findIndex(npcName => npcName === 'Akara')
        }
        if (action === NpcActionEnum.repair) {
          id = bot.npcsNames.findIndex(npcName => npcName === 'Charsi')
        }
        break
      case 'LEVEL_LUT_GHOLEIN':
        if (action === NpcActionEnum.heal || action === NpcActionEnum.repair) {
          id = bot.npcsNames.findIndex(npcName => npcName === 'Fara')
        }
        break
      case 'LEVEL_KURAST_DOCKTOWN':
        if (action === NpcActionEnum.heal) {
          id = bot.npcsNames.findIndex(npcName => npcName === 'Ormus')
        }
        if (action === NpcActionEnum.repair) {
          id = bot.npcsNames.findIndex(npcName => npcName === 'Hratli')
        }
        break
      case 'LEVEL_THE_PANDEMONIUM_FORTRESS':
        if (action === NpcActionEnum.heal) {
          id = bot.npcsNames.findIndex(npcName => npcName === 'Jamella')
        }
        if (action === NpcActionEnum.repair) {
          id = bot.npcsNames.findIndex(npcName => npcName === 'Halbu')
        }
        break
      case 'LEVEL_HARROGATH':
        if (action === NpcActionEnum.heal) {
          id = bot.npcsNames.findIndex(npcName => npcName === 'Malah')
        }
        if (action === NpcActionEnum.repair) {
          id = bot.npcsNames.findIndex(npcName => npcName === 'Larzuk')
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

  bot.reachNpc = (action) => {
    const areaName = bot.areaNames.find(areaName => { return areaName.split(',')[1] === bot.area })
    const npc = bot.npcs.find(npc => npc.code === bot.whichNpc(action, areaName))
    bot.moveTo(false, npc.x, npc.y)
    bot.tradeNpc(npc.id)
  }

  bot.buyKeys = () => {
    // Do buy key
  }

  // Maybe we could refactor these
  // In diablo 2, only some NPC (1 per act) can heal, for example act 1 : Akara
  bot.heal = () => {
    bot.reachNpc(NpcActionEnum.heal)
  }

  // Check if i have items to repair (have a treshold of durability ex : 50% dura ... parameter in config to say when i have to repair items)
  bot.repair = (treshold) => {
    bot.reachNpc(NpcActionEnum.repair)
    // Do repair stuff
  }

  bot.reviveMerc = () => {
    bot.reachNpc(NpcActionEnum.merc)
    // Do revive stuff
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
