function inject (bot) {
  // Just leave the game, not tested
  /*
  When leaving a game
  d2gsToServer : D2GS_GAMEEXIT {}
  d2gsToClient :  D2GS_NPCSTOP {"unitId":9,"x":5758,"y":4541,"unitLife":128}
  d2gsToClient :  D2GS_GAMECONNECTIONTERMINATED {}
  d2gsToClient :  D2GS_UNLOADCOMPLETE {}
  d2gsToClient :  D2GS_GAMEEXITSUCCESSFUL {}
  sidToServer : SID_LOGONREALMEX {"clientToken":9,"hashedRealmPassword":{"type":"Buffer","data":[32,230,46,20,250,152,165,84,159,7,128,137,51,19,23,208,85,125,135,189]},"realmTitle":"Path of Diablo"}
  sidToClient : SID_LOGONREALMEX {"MCPCookie":9,"MCPStatus":0,"MCPChunk1":[0,1656],"IP":[198,98,54,85],"port":6113,"zero":0,"MCPChunk2":[173112583,0,0,1144150096,13,0,0,4231807654,3473022855,1571197212,650787684,1325819087],"battleNetUniqueName":"Elfwallader"}
  Start of mcp session
  mcpToServer : Read error for size : undefined
  mcpToServer : MCP_STARTUP {"MCPCookie":9,"MCPStatus":0,"MCPChunk1":[0,1656],"MCPChunk2":[173112583,0,0,1144150096,13,0,0,4231807654,3473022855,1571197212,650787684,1325819087],"battleNetUniqueName":"Elfwallader"}
  mcpToClient : MCP_STARTUP {"result":0}
  mcpToServer : MCP_CHARLOGON {"characterName":"xzzad"}
  mcpToClient : MCP_CHARLOGON {"result":0}
  sidToServer : SID_GETCHANNELLIST {"productId":1144150096}
  sidToServer : SID_ENTERCHAT {"characterName":"xzzad","realm":"Path of Diablo,xzzad"}

  */
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
