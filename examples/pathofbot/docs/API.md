# API

## pathofbot.createBot(options)

Connect to diablo and returns a promise resolving to a `ClientDiablo` instance

`options` is an object containing the properties :
 * username : username of the account
 * password : password of the account
 * host : sid host : diablo server host
 

## pathofbot.Bot

### selectCharacter(character)

select a character and returns a promise

### createGame(gameName, gamePassword, gameServer, difficulty)

create and join the specified game and returns a promise


### say(message)

says `message`

### pickupItems()

starts picking up close by items

### run(x, y)

run to this position

### runToWrap()

returns the closest wrap

## castSkillOnLocation(x, y, skill)

cast given skill on this location

### playerList

contains the player list

### bot._client

bot._client is the low level API and should be avoided if possible

#### bot._client.on("packetName", params)

for each diablo2 packet (see data/d2gs.json, data/mcp.json, data/bnftp.json, data/sid.json)
emit an event when a packet is received

#### bot._client.on("packet", name, params)

emit an event with `name` and `params`

#### bot._client.write(name, params)

sends the packet `name` with `params` to the corresponding server
