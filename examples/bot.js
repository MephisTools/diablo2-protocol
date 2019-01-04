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
    })

    clientDiablo.on('D2GS_PLAYERJOINED', ({ playerId, charName }) => {
      clientDiablo.playerList.push({ id: playerId, name: Buffer.from(charName).toString() })
    })

    clientDiablo.on('D2GS_PLAYERLEFT', (playerId) => {
      const index = clientDiablo.playerList.findIndex(e => e.playerId === playerId)
      clientDiablo.playerList.splice(index, 1)
    })

    clientDiablo.run = (x, y) =>
      clientDiablo.write('D2GS_RUNTOLOCATION', {
        xCoordinate: x,
        yCoordinate: y
      })

    clientDiablo.castSkill = (x, y, skill) => {
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

    clientDiablo.on('D2GS_GAMECHAT', ({ charName, message }) => {
      if (message === '.master') {
        if (clientDiablo.master === null) {
          /*
          clientDiablo.write('D2GS_CHATMESSAGE', {
            type: 1,
            unk1: 0,
            message: charName + ' is now master'
          })
          */
          clientDiablo.master = charName
        } else {
          /*
          clientDiablo.write('D2GS_CHATMESSAGE', {
            type: 1,
            unk1: 0,
            message: clientDiablo.master + ' is already master'
          })
          */
        }
      }

      if (message === '.follow' && charName === clientDiablo.master) {
        clientDiablo.follow = !clientDiablo.follow
        /*
        clientDiablo.write('D2GS_CHATMESSAGE', {
          type: 1,
          unk1: 0,
          message: 'follow ' + clientDiablo.follow ? 'ON' : 'OFF'
        })
        */

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
        /*
        clientDiablo.write('D2GS_CHATMESSAGE', {
          type: 1,
          unk1: 0,
          message: 'autokill ' + clientDiablo.autokill ? 'ON' : 'OFF'
        })
        */

        // TODO: FIX this
        if (!clientDiablo.autokill) {
          clientDiablo.removeAllListeners('D2GS_NPCMOVE')
          clientDiablo.removeAllListeners('D2GS_NPCMOVETOTARGET')
          clientDiablo.removeAllListeners('D2GS_NPCATTACK')
        } else {
          clientDiablo.on('D2GS_NPCMOVE', ({ x, y }) => {
            clientDiablo.castSkill(x, y, 49)
          })
          clientDiablo.on('D2GS_NPCMOVETOTARGET', ({ x, y }) => {
            clientDiablo.castSkill(x, y, 49)
          })
          clientDiablo.on('D2GS_NPCATTACK', ({ x, y }) => {
            clientDiablo.castSkill(x, y, 49)
          })
        }
      }
    })

    await clientDiablo.selectCharacter(character)
    await clientDiablo.createGame(gameName, gamePassword, gameServer, 0)
    console.log('Has joined the game')
  })
