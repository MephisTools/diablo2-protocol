const { createClientDiablo } = require('..')
const { defaultVersion } = require('..')

var ArgumentParser = require('argparse').ArgumentParser
var parser = new ArgumentParser({
  version: '1.4.1',
  addHelp: true,
  description: 'Simple bot'
})
parser.addArgument([ '-au', '--username' ], { required: true })
parser.addArgument([ '-ap', '--password' ], { required: true })
parser.addArgument([ '-c', '--character' ], { required: true })
parser.addArgument([ '-gn', '--gameName' ], { required: true })
parser.addArgument([ '-gp', '--gamePassword' ], { required: true })
parser.addArgument([ '-gs', '--gameServer' ], { required: true })
parser.addArgument([ '-s', '--sidServer' ], { required: true })
parser.addArgument([ '-dv', '--diabloVersion' ], { defaultValue: defaultVersion })
parser.addArgument([ '-k1', '--keyClassic' ], { required: true })
parser.addArgument([ '-k2', '--keyExtension' ], { required: true })

const { username, password, character, gameName, gamePassword, gameServer, sidServer, diabloVersion, keyClassic, keyExtension } = parser.parseArgs()

async function start () {
  const clientDiablo = createClientDiablo({
    host: sidServer,
    username,
    password,
    version: diabloVersion,
    keyClassic,
    keyExtension
  })
  clientDiablo.on('D2GS_PLAYERMOVE', ({ targetX, targetY }) => {
    clientDiablo.write('D2GS_RUNTOLOCATION', {
      x: targetX,
      y: targetY
    })
  })

  await clientDiablo.connect()
  await clientDiablo.selectCharacter(character)
  await clientDiablo.createGame(gameName, gamePassword, gameServer, 0)
  console.log('Has joined the game')
}

start()
