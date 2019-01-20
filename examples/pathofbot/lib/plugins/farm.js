function inject (bot) {
  function randomString () {
    const possible = 'abcdefghijklmnopqrstuvwxyz'
    let randomString = ''

    for (let i = 0; i < 5; i++) { randomString += possible.charAt(Math.floor(Math.random() * possible.length)) }
    return randomString
  }

  // This is supposed to farm one or multiple scripts like killing mephisto, doing a quest, cow level, rushing a mule ... in a loop
  bot.farmLoop = async (scriptToFarm, gameServer) => {
    let nbRuns = 100
    while (nbRuns > 0) {
      await bot.createGame(randomString(), randomString(), gameServer, 0)
      bot.checkTown()
      bot.takeWaypoint()
      // Pathfinding here
      bot.exit()
      nbRuns--
    }
  }
}
module.exports = inject
