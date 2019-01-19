// const levelPreset = require('../../../../lib/map/level')
// const aStar = require('a-star')

function inject (bot) {
  bot.warps = []

  bot._client.on('D2GS_ASSIGNLVLWARP', ({ unitId, x, y, warpId }) => {
    bot.warps.push({ unitId, x, y, warpId })
  })
  bot._client.on('D2GS_LOADACT ', ({ areaId }) => {
    bot.area = areaId
    // bot.objects = levelPreset('/home/louis/Desktop/d2datamerged', areaId)
  })
  bot._client.on('D2GS_REASSIGNPLAYER', ({ x, y }) => {
    bot.x = x
    bot.y = y
  })
  bot._client.on('D2GS_WALKVERIFY', ({ x, y }) => {
    bot.x = x
    bot.y = y
  })

  bot.run = (x, y) => {
    bot._client.write('D2GS_RUNTOLOCATION', {
      xCoordinate: x,
      yCoordinate: y
    })
  }

  bot.moveTo = (teleportation, x, y) => {
    pf(teleportation, x, y)
  }

  async function pf (teleportation, x, y) {
    const start = +new Date()
    let stuck = 0
    bot.say(`My position ${bot.x} - ${bot.y}`)
    bot.say(`Heading to ${x} - ${y} by ${teleportation ? 'teleporting' : 'walking'}`)
    bot.say(`Calculated distance ${Math.sqrt((bot.x - x) * (bot.x - x) + (bot.y - y) * (bot.y - y))}`)
    bot.say(`Direction ${degreeBetweenTwoPoints({ x: bot.x, y: bot.y }, { x: x, y: y })}`)
    // We'll continue till arrived at destination
    while (Math.sqrt((bot.x - x) * (bot.x - x) + (bot.y - y) * (bot.y - y)) > 20 || +new Date() < start + 20000) { // timeout
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

  function getRandomInt (min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  // This will return when the movement is done
  async function movement (teleportation, destX, destY) {
    return new Promise(resolve => {
      if (!teleportation) {
        const callback = ({ x, y }) => {
          bot.say(`endOfMovement at ${x};${y}`)
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
      bot.run(nextArea.x, nextArea.y)
      bot.say(`Heading for the next area`)
      bot._client.removeAllListeners('D2GS_PLAYERMOVE')
      bot.follow = false
      bot.say(`Follow off`)
    } catch (error) {
      bot.say('Can\'t find any warp')
    }
  }

  // I noticed sometihng, everytime you take a wp, (only tested with the same act3 camp to durance lvl 2) in the same game,
  // The id increment, here it was from 28 to 94 idk if its linear or not
  bot.takeWaypoint = (waypoint, level) => {
    bot._client.once('D2GS_WAYPOINTMENU', ({ unitId, availableWaypoints }) => {
      bot._client.write('D2GS_WAYPOINT', { // TODO: Handle the case where the bot aint got the wp
        waypointId: unitId,
        unknown: 0,
        levelNumber: level
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
    bot._client.write('D2GS_USESCROLL', { // TODO: finish this
      type: 4,
      itemId: 1
    })
  }

  /*
  // Tentative to do pathfinding by exploring all 4 corners of the map
  // The bot should stop when receiving assignlvlwarp from the next area
  const DirectionsEnum = Object.freeze({ 'left': 1, 'top': 2, 'right': 3, 'bottom': 4 })

  // This will return when the teleportation is done
  async function reachedPosition (previousPos) {
    return new Promise(resolve => {
      bot.say(`arrived at ${bot.x};${bot.y}`)
      bot.say(`previousPos difference ${Math.abs(bot.x - previousPos.x)};${Math.abs(bot.y - previousPos.y)}`)
      // We check if we moved
      resolve(Math.abs(bot.x - previousPos.x) > 5 || Math.abs(bot.y - previousPos.y) > 5) // Means we hit a corner
    })
  }

  // TODO: Return the path used, to get optimized latter
  async function reachedWarp (x, y, direction = DirectionsEnum.left) {
    if (bot.warps.find(warp => warp.id === bot.area + 1)) {
      // Just checking if we got to the next area ...
      return { x, y, warpId, id }
    }
    // Reset the direction
    if (direction === DirectionsEnum.bottom) {
      direction = DirectionsEnum.left
    }
    let reachedCorner = false
    let nextPos = { x: bot.x, y: bot.y }
    while (!reachedCorner) {
      if (direction === DirectionsEnum.left) {
        nextPos = { x: bot.x, y: bot.y + 20 }
      }
      if (direction === DirectionsEnum.top) {
        nextPos = { x: bot.x + 20, y: bot.y }
      }
      if (direction === DirectionsEnum.right) {
        nextPos = { x: bot.x, y: bot.y - 20 }
      }
      if (direction === DirectionsEnum.top) {
        nextPos = { x: bot.x - 20, y: bot.y }
      }
      const previousPos = { x: bot.x, y: bot.y }
      bot.say(`castSkillOnLocation at ${nextPos.x};${nextPos.y}`)
      bot.castSkillOnLocation(nextPos.x, nextPos.y, 53)
      reachedCorner = await reachedPosition(previousPos)
    }
    bot.say(`Going ${direction}`)
    reachedWarp(bot.x, bot.y, direction++)
  }

  bot.pathFind = () => {
    bot.say('Looking for the next level !')
    const success = reachedWarp(bot.x, bot.y)
    bot.say(success ? 'Found the next level' : 'Could\'nt find the next level')
  }
  */
}

module.exports = inject
