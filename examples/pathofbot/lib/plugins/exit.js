function inject (bot) {
  process.on('SIGINT', () => {
    bot._client.write('D2GS_GAMEEXIT', {})
    bot._client.write('SID_LEAVEGAME', {})

    process.exit()
  })
}

module.exports = inject
