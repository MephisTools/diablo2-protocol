function inject (bot) {
  bot._client.on('D2GS_PLAYERJOINED', ({ playerId, charName }) => {
    bot.playerList.push({ id: playerId, name: Buffer.from(charName).toString().replace(/\0.*$/g, '') })
  })

  bot._client.on('D2GS_PLAYERLEFT', (playerId) => {
    // If the master leave, we leave the game too
    if (bot.master !== null && bot.master.id === playerId) {
      bot.exit()
    }
    const index = bot.playerList.findIndex(e => e.playerId === playerId)
    bot.playerList.splice(index, 1)
  })
  /*
  // Doesnt work yet
  bot._client.on('D2GS_PLAYERRELATIONSHIP', ({ unitId, state }) => { // AutoParty
    bot._client.write('D2GS_PARTY', {
      actionId: 7, // TODO: what is it
      playerId: unitId
    })
  })
  */
}

module.exports = inject
