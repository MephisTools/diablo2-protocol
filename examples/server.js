const createServerDiablo = require('..').createServerDiablo

const serverDiablo = createServerDiablo('127.0.0.1')

serverDiablo.on('connection', client => {
  client.on('packet', ({ name, params }) => {
    console.log(name, params)
  })
})
