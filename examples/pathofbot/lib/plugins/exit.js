function inject (bot) {
  process.on('SIGINT', () => {
    bot.write('D2GS_GAMEEXIT', {})
    bot.write('SID_LEAVEGAME', {})

    process.exit()
  })
}

module.exports = inject
