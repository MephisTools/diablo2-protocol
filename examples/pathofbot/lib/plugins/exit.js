function inject (bot) {
  // Just leave the game, not tested
  bot.exit = () => { // Clear all variables?
    bot._client.write('D2GS_GAMEEXIT', {})
    bot._client.write('SID_LEAVEGAME', {})
    bot.playerList = []
  }

  process.on('SIGINT', () => {
    bot._client.write('D2GS_GAMEEXIT', {})
    bot._client.write('SID_LEAVEGAME', {})

    setTimeout(() => process.exit(), 2000)
  })
}

module.exports = inject
