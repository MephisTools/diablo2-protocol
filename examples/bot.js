const { createClientDiablo } = require('..')

if (process.argv.length !== 8) {
  // Game servers list at https://pathofdiablo.com/p/
  // 21 france, 4 london ...
  console.log('Usage : node bot.js <username> <password> <character> <gamename> <gamepasswd> <gameserver>')
  process.exit(1)
}

const possible = 'abcdefghijklmnopqrstuvwxyz'
let randomGame = ''

for (let i = 0; i < 5; i++) { randomGame += possible.charAt(Math.floor(Math.random() * possible.length)) }

if (process.argv[5] === 'rand') { console.log('connecting to randomGame ' + randomGame) }

const character = process.argv[4]
const gameName = process.argv[5] === 'rand' ? randomGame : process.argv[5]
const gamePassword = '' // process.argv[6], // TODO add back when password is fixed
const gameServer = process.argv[7]

createClientDiablo({
  host: '198.98.54.85',
  username: process.argv[2],
  password: process.argv[3]
})
  .then(async (clientDiablo) => {
    clientDiablo.master = null
    clientDiablo.playerList = []
    clientDiablo.follow = false

    process.on('SIGINT', () => {
      clientDiablo.write('D2GS_GAMEEXIT', {})
      clientDiablo.write('SID_LEAVEGAME', {})

      process.exit()
      // clientDiablo.on('D2GS_GAMECONNECTIONTERMINATED', () => {
      // })
      /*
      from sniffer
      d2gsToServer : D2GS_GAMEEXIT {}
      d2gsToClient :  D2GS_GAMECONNECTIONTERMINATED {}
      d2gsToClient :  D2GS_UNLOADCOMPLETE {}
      d2gsToClient :  D2GS_GAMEEXITSUCCESSFUL {}
      */
    })
    /*
    take body d2gsToServer : D2GS_INTERACTWITHENTITY {"entityType":0,"entityId":3}
    d2gsToClient :  D2GS_CORPSEASSIGN {"assign":0,"ownerId":2,"corpseId":3}
    d2gsToClient :  D2GS_REMOVEOBJECT {"unitType":0,"unitId":3}
    d2gsToClient :  D2GS_ITEMACTIONOWNED {"unknown1":6,"unknown2":[5,98,2,0,0,0,2,0,0,0,17,0,130,0,101,132,8,128,22,134,7,130,128,160,146,226,63]}
    d2gsToClient :  D2GS_ITEMACTIONOWNED {"unknown1":6,"unknown2":[6,99,2,0,0,0,2,0,0,0,17,0,130,0,101,164,10,128,22,134,7,130,128,160,114,226,63]}
    */

    clientDiablo.on('D2GS_PLAYERJOINED', ({ playerId, charName }) => {
      clientDiablo.playerList.push({ id: playerId, name: Buffer.from(charName).toString() })
    })

    clientDiablo.on('D2GS_PLAYERLEFT', (playerId) => {
      const index = clientDiablo.playerList.findIndex(e => e.playerId === playerId)
      clientDiablo.playerList.splice(index, 1)
    })

    clientDiablo.warps = []
    clientDiablo.on('D2GS_ASSIGNLVLWARP', ({ unitId, x, y, warpId }) => {
      clientDiablo.warps.push({ unitId, x, y, warpId })
    })
    clientDiablo.findWarp = () => {
      /*
      let warpDistance = 9999999
      let currentDistance = 0
      for (let i = 0; i < clientDiablo.warps.length; i++) {
        currentDistance = Math.sqrt(Math.pow(clientDiablo.warps[i].x - clientDiablo.x) + Math.pow(clientDiablo.warps[i].y - clientDiablo.y))
        if (currentDistance < warpDistance) {
          warpDistance = currentDistance
        }
      }
      */

      clientDiablo.run(clientDiablo.warps[clientDiablo.warps.length - 1])
      // D2GS_ASSIGNLVLWARP {"unitType":5,"unitId":11,"x":59907,"y":21265,"warpId":44053}
    }

    clientDiablo.pickupItems = () => { // TODO: queue pickup list to catch'em all
      clientDiablo.inventory = []
      clientDiablo.on('D2GS_ITEMACTIONWORLD', ({ unknown2 }) => {
        clientDiablo.write('D2GS_RUNTOENTITY', {
          entityType: 4,
          entityId: unknown2[1] // 2nd element seems to be the id
        })
        clientDiablo.write('D2GS_PICKUPITEM', { // Possible action IDs: 0x00 - Move item to inventory 0x01 - Move item to cursor buffer
          unitType: 4,
          unitId: unknown2[1]
        })
        clientDiablo.once('D2GS_REMOVEOBJECT', ({ unitType, unitId }) => { // Maybe its not optimal ? (not sure it's me who picked it)
          clientDiablo.inventory.push({ unitType, unitId })
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

    clientDiablo.run = (x, y) => {
      clientDiablo.write('D2GS_RUNTOLOCATION', {
        xCoordinate: x,
        yCoordinate: y
      })
      clientDiablo.x = x
      clientDiablo.y = y
    }

    clientDiablo.castSkillOnLocation = (x, y, skill) => {
      clientDiablo.write('D2GS_SWITCHSKILL', {
        skill: skill,
        unk1: 0,
        hand: 0, // 0 = right, 128 = left
        unknown: [255, 255, 255, 255, 255]
      })
      clientDiablo.write('D2GS_RIGHTSKILLONLOCATION', {
        xCoordinate: x,
        yCoordinate: y
      })
    }

    clientDiablo.castSkillOnEntity = (type, id, skill) => {
      /*
      clientDiablo.write('D2GS_SWITCHSKILL', {
        skill: skill,
        unk1: 0,
        hand: 0, // 0 = right, 128 = left
        unknown: [255, 255, 255, 255, 255]
      })
      */
      clientDiablo.write('D2GS_RIGHTSKILLONENTITYEX3', {
        entityType: type,
        entityId: id
      })
    }

    clientDiablo.on('D2GS_GAMECHAT', ({ charName, message }) => {
      if (message === '.master') {
        if (clientDiablo.master === null) {
          clientDiablo.write('D2GS_CHATMESSAGE', {
            type: 1,
            unk1: 0,
            message: charName + ' is now master'
          })

          clientDiablo.master = charName
        } else {
          clientDiablo.write('D2GS_CHATMESSAGE', {
            type: 1,
            unk1: 0,
            message: clientDiablo.master + ' is already master'
          })
        }
      }

      if (message === '.follow' && charName === clientDiablo.master) {
        clientDiablo.follow = !clientDiablo.follow
        clientDiablo.write('D2GS_CHATMESSAGE', {
          type: 1,
          unk1: 0,
          message: 'follow ' + clientDiablo.follow ? 'ON' : 'OFF'
        })

        if (!clientDiablo.follow) {
          clientDiablo.removeAllListeners('D2GS_PLAYERMOVE')
        } else {
          clientDiablo.on('D2GS_PLAYERMOVE', ({ targetX, targetY }) => {
            clientDiablo.run(targetX, targetY)
          })
        }
      }

      if (message === '.autokill' && charName === clientDiablo.master) {
        clientDiablo.autokill = !clientDiablo.autokill
        clientDiablo.write('D2GS_CHATMESSAGE', {
          type: 1,
          unk1: 0,
          message: 'autokill ' + clientDiablo.autokill ? 'ON' : 'OFF'
        })

        // TODO: FIX this
        if (!clientDiablo.autokill) {
          clientDiablo.removeAllListeners('D2GS_NPCMOVE')
          clientDiablo.removeAllListeners('D2GS_NPCMOVETOTARGET')
          // clientDiablo.removeAllListeners('D2GS_NPCATTACK')
        } else {
          // Doesn't work if target too far
          clientDiablo.on('D2GS_NPCMOVE', ({ unitId, type, x, y }) => {
            let a = (x - clientDiablo.x)
            let b = (y - clientDiablo.y)

            if (Math.sqrt(a * a + b * b) < 10) { // Euclidean distance
              clientDiablo.target = unitId
              // clientDiablo.run(x, y)
              // clientDiablo.castSkillOnEntity(type, unitId, 1)
              clientDiablo.castSkillOnLocation(x, y, 0)
            }
            // clientDiablo.castSkill(unitId, type, 49)
          })
          clientDiablo.on('D2GS_NPCMOVETOTARGET', ({ unitId, type, x, y }) => {
            let a = (x - clientDiablo.x)
            let b = (y - clientDiablo.y)

            if (Math.sqrt(a * a + b * b) < 10) { // Euclidean distance
              // clientDiablo.run(x, y)
              // clientDiablo.castSkillOnEntity(type, unitId, 1)
              clientDiablo.castSkillOnLocation(x, y, 0)
            }
            // clientDiablo.castSkill(unitId, type, 49)
          })
          /*
          clientDiablo.on('D2GS_NPCATTACK', ({ x, y }) => {
            clientDiablo.castSkill(x, y, 49)
          })
          */
        }
      }

      if (message === '.pickup' && charName === clientDiablo.master) {
        clientDiablo.pickup = !clientDiablo.pickup
        clientDiablo.write('D2GS_CHATMESSAGE', {
          type: 1,
          unk1: 0,
          message: `pickup  ${clientDiablo.pickup ? 'ON' : 'OFF'}`
        })

        if (!clientDiablo.pickup) {
          clientDiablo.removeAllListeners('D2GS_ITEMACTIONWORLD')
        } else {
          clientDiablo.pickupItems()
        }
      }

      if (message === '.warp' && charName === clientDiablo.master) {
        clientDiablo.findWarp()
        clientDiablo.write('D2GS_CHATMESSAGE', {
          type: 1,
          unk1: 0,
          message: `heading for the last warp`
        })
      }
      /*
      // Doesnt work :D
      if (message === '.yolo' && charName === clientDiablo.master) {
        clientDiablo.write('D2GS_INTERACTWITHENTITY', {
          entityType: 2,
          entityId: 49
        })
        clientDiablo.on('D2GS_WAYPOINTMENU', () => {
          clientDiablo.write('D2GS_WAYPOINT', {
            waypointId: 49,
            unknown: 0,
            levelNumber: 129
          })
        })
      }
      */
    })

    await clientDiablo.selectCharacter(character)
    await clientDiablo.createGame(gameName, gamePassword, gameServer, 0)
    console.log('Has joined the game')
  })
