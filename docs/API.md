# API

## diablo.createClientDiablo(options)

Returns a `ClientDiablo` instance and connect to diablo

`options` is an object containing the properties :
 * username : username of the account
 * password : password of the account
 * host : sid host : diablo server host
 * character : character name
 * gameName : game name
 * gamePassword : game password
 * gameServer : game server

## diablo.ClientDiablo

### "packetName" (params)

for each diablo2 packet (see data/d2gs.json, data/mcp.json, data/bnftp.json, data/sid.json)
emit an event when a packet is received

### write(name, params)

sends the packet `name` with `params` to the corresponding server




