// const levelPreset = require('../../../../lib/map/level')
// const aStar = require('a-star')

function inject (bot) {
  bot.warps = []

  bot._client.on('D2GS_ASSIGNLVLWARP', ({ unitId, x, y, warpId }) => {
    bot.warps.push({ unitId, x, y, warpId })
  })
  bot._client.on('D2GS_LOADACT', ({ areaId }) => {
    if (bot.area !== areaId) {
      bot.say(`My area ${areaId}`)
    }
    bot.area = areaId
  })
  bot._client.on('D2GS_MAPREVEAL', ({ areaId }) => {
    if (bot.area !== areaId) {
      bot.say(`My area ${areaId}`)
    }
    bot.area = areaId
  })
  bot._client.on('D2GS_REASSIGNPLAYER', ({ x, y }) => {
    bot.x = x
    bot.y = y
  })
  bot._client.on('D2GS_WALKVERIFY', ({ x, y }) => {
    bot.x = x
    bot.y = y
  })

  // Maybe remove this
  bot.run = (x, y) => {
    bot._client.write('D2GS_RUNTOLOCATION', {
      xCoordinate: x,
      yCoordinate: y
    })
  }

  bot.moveTo = (teleportation, x, y) => {
    pf(teleportation, x, y)
  }

  // TODO: test, make it works for all type of entity
  bot.moveTo = (teleportation, entityId) => {
    let entity = bot.npcs.find(npc => { return npc.id === entityId })
    let type = 1
    if (entity === undefined) {
      entity = bot.warps.find(warp => { return warp.id === entityId })
      type = 2
    }
    pf(teleportation, entity.x, entity.y)
    bot._client.write('D2GS_RUNTOENTITY', {
      entityType: type, // 1 seems to be npc, 2 portal ...
      entityId: entityId
    })
  }

  async function pf (teleportation, x, y) {
    const start = +new Date()
    let stuck = 0
    bot.say(`My position ${bot.x} - ${bot.y}`)
    bot.say(`Heading to ${x} - ${y} by ${teleportation ? 'teleporting' : 'walking'}`)
    bot.say(`Direction ${degreeBetweenTwoPoints({ x: bot.x, y: bot.y }, { x: x, y: y })}`)
    // We'll continue till arrived at destination
    while (parseInt(Math.sqrt((bot.x - x) * (bot.x - x) + (bot.y - y) * (bot.y - y))) > 15 || +new Date() < start + 20000) { // timeout
      bot.say(`Calculated distance ${Math.sqrt((bot.x - x) * (bot.x - x) + (bot.y - y) * (bot.y - y))}`)
      let previousPosition = { x: bot.x, y: bot.y }
      let degree = degreeBetweenTwoPoints({ x: bot.x, y: bot.y }, { x: x, y: y })
      let dest = coordFromDistanceAndAngle({ x: bot.x, y: bot.y }, 20, degree)
      bot.say(`Movement to ${dest.x} - ${dest.y}`)
      await movement(teleportation, dest.x, dest.y)
      if (previousPosition.x === bot.x && previousPosition.y === bot.y) { // If the bot is stuck
        bot.say('Stuck')
        stuck += 0.1
        degree *= (2 + stuck)
      } else {
        stuck = 0
      }
    }
    bot.say(`Arrived at destination`)
  }

  /*
  function getRandomInt (min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1)) + min
  }
  */

  // This will return when the movement is done
  async function movement (teleportation, destX, destY) {
    return new Promise(resolve => {
      if (!teleportation) {
        const callback = ({ x, y }) => {
          // bot.say(`endOfMovement at ${x};${y}`)
          clearTimeout(timeOut)
          resolve()
        }
        bot._client.once('D2GS_WALKVERIFY', callback)
        bot.run(destX, destY)
        const timeOut = setTimeout(() => { // in case we run in a wall
          bot._client.removeListener('D2GS_WALKVERIFY', callback)
          resolve()
        }, 2000)
      } else {
        bot._client.once('D2GS_REASSIGNPLAYER', ({ x, y }) => {
          bot.say(`endOfMovement at ${x};${y}`)
          resolve()
        })
        bot.castSkillOnLocation(destX, destY, 53)
      }
    })
  }

  function degreeBetweenTwoPoints (a, b) {
    return Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI
  }

  // Return the coordinate of a point with at a distance dist and degree angle from point point
  function coordFromDistanceAndAngle (point, dist, angle) {
    return { x: Math.cos(angle * Math.PI / 180) * dist + point.x, y: Math.sin(angle * Math.PI / 180) * dist + point.y }
  }

  bot.runToWarp = () => {
    try {
      const nextArea = bot.warps.find(warp => {
        return warp.warpId === bot.area + 1
      })
      bot.moveTo(false, nextArea.x, nextArea.y)
      bot.say(`Heading for the next area`)
      bot._client.removeAllListeners('D2GS_PLAYERMOVE')
      bot.follow = false
      bot.say(`Follow off`)
    } catch (error) {
      bot.say('Can\'t find any warp')
    }
  }

  bot.takeWaypoint = (waypoint, level) => {
    const idArea = bot.areaNames.findIndex(areaName => { return areaName.split('')[0].includes(level) })
    bot._client.once('D2GS_WAYPOINTMENU', ({ unitId, availableWaypoints }) => {
      bot._client.write('D2GS_WAYPOINT', { // TODO: Handle the case where the bot aint got the wp
        waypointId: unitId,
        unknown: 0,
        levelNumber: idArea
      })
    })
    bot._client.write('D2GS_RUNTOENTITY', {
      entityType: 2,
      entityId: waypoint
    })
    bot._client.write('D2GS_INTERACTWITHENTITY', {
      entityType: 2,
      entityId: waypoint
    })
  }

  bot.base = () => {
    bot._client.once('D2GS_PORTALOWNERSHIP', ({ ownerId, ownerName, localId, remoteId }) => {
      bot._client.write('D2GS_RUNTOENTITY', {
        entityType: 2,
        entityId: localId
      })
      bot._client.write('D2GS_INTERACTWITHENTITY', {
        entityType: 2,
        entityId: localId
      })
    })
    if (bot.checkTomes(true) > 0) {
      bot.castSkillOnLocation(bot.x, bot.y, 220) // Must have a tome of portal
    } else {
      bot._client.write('D2GS_USESCROLL', {
        type: 4,
        itemId: 1
      })
    }
  }
}

module.exports = inject
