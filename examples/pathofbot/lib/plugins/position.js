function inject (bot) {
  bot.warps = []
  bot._client.on('D2GS_ASSIGNLVLWARP', ({ unitId, x, y, warpId }) => {
    bot.warps.push({ unitId, x, y, warpId })
  })

  bot.run = (x, y) => {
    bot._client.write('D2GS_RUNTOLOCATION', {
      xCoordinate: x,
      yCoordinate: y
    })
    bot.x = x
    bot.y = y
  }

  bot.findWarp = () => {
    /*
    let warpDistance = 9999999
    let currentDistance = 0
    for (let i = 0; i < bot.warps.length; i++) {
      currentDistance = Math.sqrt(Math.pow(bot.warps[i].x - bot.x) + Math.pow(bot.warps[i].y - bot.y))
      if (currentDistance < warpDistance) {
        warpDistance = currentDistance
      }
    }
    */
    try {
      bot.run(bot.warps[bot.warps.length - 1].x, bot.warps[bot.warps.length - 1].y)
      bot.say(`Heading for the last warp`)
      bot._client.removeAllListeners('D2GS_PLAYERMOVE')
      bot.follow = false
      bot.say(`Follow off`)
    } catch (error) {
      bot.say('Can\'t find any warp')
    }
  }
}

module.exports = inject
