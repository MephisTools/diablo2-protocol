const createClient = require('./createClient');

const client = createClient({
    port: 6112,
    host:'176.31.38.228',
    username: process.argv[4],
    password: process.argv[5]
});

if (process.argv.length < 2 || process.argv.length > 2) {
    console.log('Usage : node bot.js [<name>] [<password>]')
    process.exit(1)
}

