function inject (bot) {
  bot.say = (message) => { // TODO: Maybe an option to whisper the master
    bot._client.write('D2GS_CHATMESSAGE', {
      type: 1,
      unk1: 0,
      unk2: 0,
      message: message
    })
  }
}

module.exports = inject
