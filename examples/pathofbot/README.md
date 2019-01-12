# Path of bot

Create Diablo2 bots with a powerful, stable, and high level JavaScript API.

## Features

* chat
* follow
* pick up items

## Roadmap

* map
* inventory

## Usage

```js
const { createBot } = require('.')

async function start () {
  const bot = await createBot({
    host: '198.98.54.85',
    username: 'myusername',
    password: 'mypassword'
  })
  await bot.selectCharacter('mycharacter')
  await bot.createGame('mygame', '', 'game server', 0)
}

start()

```

## Documentation

* See docs/API.md