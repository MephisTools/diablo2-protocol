function inject (bot) {
  const WebSocket = require('ws')

  const wss = new WebSocket.Server({ port: 8080 })

  wss.broadcast = function broadcast (data) {
    wss.clients.forEach(function each (client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data)
      }
    })
  }

  bot._client.on('packet', ({ protocol, name, params }) => {
    wss.broadcast(JSON.stringify({ protocol, name, params }))
  })
  bot._client.on('sentPacket', ({ protocol, name, params }) => {
    wss.broadcast(JSON.stringify({ protocol, name, params }))
  })
}

module.exports = inject
