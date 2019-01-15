// Look https://github.com/kolton/d2bot-with-kolbot/blob/24f9a406831ae24cd72b2783c539936379cfa0d9/d2bs/kolbot/libs/common/Town.js

// We should have the list of town's NPCs with the id associated so we can init stuff with them
function inject (bot) {
  bot.npcShop = []
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
  // Check if i have enough pots in my belt (have a config where we say what kind of potions we want the bot to always have)
  bot.buyPotions = (npcId) => {
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
      bot.tradeNpc(npcId)
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

      while (healthPotions < 4) {
        bot._client.once('D2GS_ITEMACTIONWORLD', ({ id, type, name, x, y, width, height, container }) => {
          bot.inventory.push({ id: id, type: type, name: name, x: x, y: y, width: width, height: height, container: container })
        })
        bot._client.once('D2GS_NPCTRANSACTION', ({ tradeType, result, unknown, merchandiseId, goldInInventory }) => {
          if (result === 0) {
            healthPotions++
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

      while (manaPotions < 4) {
        bot._client.once('D2GS_ITEMACTIONWORLD', ({ id, type, name, x, y, width, height, container }) => {
          bot.inventory.push({ id: id, type: type, name: name, x: x, y: y, width: width, height: height, container: container })
        })
        bot._client.once('D2GS_NPCTRANSACTION', ({ tradeType, result, unknown, merchandiseId, goldInInventory }) => {
          if (result === 0) {
            manaPotions++
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
      bot._client.write('D2GS_NPCCANCEL', {
        entityType: 1,
        npcId: npcId
      })
    } else {
      bot.say(`I can't afford potions`)
    }
  }

  // Check if i have enough scroll in my books (don't buy identify stuff if we use cain anyway)
  // Optmized version wouldn't close then reopen between buys like potions then tome ...
  bot.fillTome = (npcId) => {
    if (bot.gold > 1000) { // TODO: config treshold
      bot.tradeNpc(npcId)
      bot._client.write('D2GS_NPCCANCEL', {
        entityType: 1,
        npcId: npcId
      })
    }
  }

  bot.buyKeys = () => {
  }

  // In diablo 2, only some NPC (1 per act) can heal, for example act 1 : Akara
  bot.heal = () => {
  }

  bot.identify = () => {
  }

  // Check if i have items to repair (have a treshold of durability ex : 50% dura ... parameter in config to say when i have to repair items)
  bot.repair = (treshold) => {
  }

  bot.reviveMerc = () => {
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
