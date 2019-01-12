const { createClientDiablo } = require('../..')
const chat = require('./lib/plugins/chat')
const commands = require('./lib/plugins/commands')
const exit = require('./lib/plugins/exit')
const inventory = require('./lib/plugins/inventory')
const players = require('./lib/plugins/players')
const position = require('./lib/plugins/position')
const skills = require('./lib/plugins/skills')
const EventEmitter = require('events').EventEmitter

class Bot extends EventEmitter {
  constructor () {
    super()
    this._client = null
  }

  async connect (options) {
    this._client = await createClientDiablo(options)
    this.username = this._client.username
    this._client.on('connect', () => {
      this.emit('connect')
    })
    this._client.on('error', (err) => {
      this.emit('error', err)
    })
    this._client.on('end', () => {
      this.emit('end')
    })
    this.selectCharacter = this._client.selectCharacter
    this.joinGame = this._client.joinGame
    this.createGame = this._client.createGame
  }

  end () {
    this._client.end()
  }
}

async function createBot (options) {
  const bot = new Bot()

  await bot.connect(options)

  chat(bot, options)
  commands(bot, options)
  exit(bot, options)
  inventory(bot, options)
  players(bot, options)
  position(bot, options)
  skills(bot, options)

  return bot
}

module.exports = { createBot }
