// Look https://github.com/kolton/d2bot-with-kolbot/blob/24f9a406831ae24cd72b2783c539936379cfa0d9/d2bs/kolbot/libs/common/Town.js

// We should have the list of town's NPCs with the id associated so we can init stuff with them
function inject (bot) {
  // Check if i have enough pots in my belt (have a config where we say what kind of potions we want the bot to always have)
  bot.buyPotions = () => {
  }

  // Check if i have enough scroll in my books (don't buy identify stuff if we use cain anyway)
  bot.fillTome = () => {
  }

  bot.buyKeys = () => {
  }

  // In diablo 2, only some NPC (1 per act) can heal, for example act 1 : Akara
  bot.heal = () => {
  }

  bot.identify = () => {
  }

  // Check if i have items to repair (have a treshold of durability ex : 50% dura ... parameter in config to say when i have to repair items)
  bot.repair = (treshold) => {
  }

  bot.reviveMerc = () => {
  }

  // Put everything in the stash except the required stuff (set a parameter for things we wanna always keep such as book scroll, charms ...)
  // Put extra gold in stash ...
  bot.stash = () => {
  }
}

module.exports = inject
