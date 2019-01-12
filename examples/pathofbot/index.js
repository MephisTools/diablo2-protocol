const { createClientDiablo } = require('../..')
const chat = require('./lib/plugins/chat')
const commands = require('./lib/plugins/commands')
const exit = require('./lib/plugins/exit')
const inventory = require('./lib/plugins/inventory')
const players = require('./lib/plugins/players')
const position = require('./lib/plugins/position')
const skills = require('./lib/plugins/skills')

async function createBot (options) {
  const bot = await createClientDiablo(options)

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
