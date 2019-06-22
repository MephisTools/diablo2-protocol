# API

## diablo.createClientDiablo(options)

Connect to diablo and returns a promise resolving to a `ClientDiablo` instance

`options` is an object containing the properties :
 * username : username of the account
 * password : password of the account
 * host : sid host : diablo server host
 * version : version of diablo
 

## diablo.ClientDiablo

### connect()

connect to battlenet, returns a promise

### selectCharacter(character)

select a character and returns a promise

### createGame(gameName, gamePassword, gameServer, difficulty)

create and join the specified game and returns a promise

### "packetName" (params)

for each diablo2 packet (see data/d2gs.json, data/mcp.json, data/bnftp.json, data/sid.json)
emit an event when a packet is received

### "packet" (name, params)

emit an event with `name` and `params`

### write(name, params)

sends the packet `name` with `params` to the corresponding server

## createServerDiablo()

Make a diablo server, returns a `ServerDiablo` instance

## diablo.ServerDiablo

### "connection" (clientDiablo)

emits an event with a `ClientDiablo`. See above for doc
