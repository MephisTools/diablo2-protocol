const createClient = require('./createClient');

if (process.argv.length !== 4) {
  console.log('Usage : node bot.js [<name>] [<password>]')
  process.exit(1)
}

const client = createClient({
    port: 6112,
    host:'176.31.38.228',
    username: process.argv[2],
    password: process.argv[3]
});
