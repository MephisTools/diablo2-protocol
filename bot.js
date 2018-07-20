const createClient = require('./createClient');

console.log(process.argv.length);

if (process.argv.length !== 8) {
  // Game servers list at https://pathofdiablo.com/p/
  // 21 france, 4 london ...
  console.log('Usage : node bot.js <username> <password> <character> <gamename> <gamepasswd> <gameserver>')
  process.exit(1)
}

const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
let randomGame = ""

for (let i = 0; i < 5; i++)
    randomGame += possible.charAt(Math.floor(Math.random() * possible.length));

if(process.argv[5] === 'rand')
  console.log('connecting to randomGame '+randomGame);

const client = createClient({
    port: 6112,
    host:'176.31.38.228',
    username: process.argv[2],
    password: process.argv[3],
    character: process.argv[4],
    gameName: process.argv[5] === "rand" ? randomGame : process.argv[5],
    gamePassword: process.argv[6],
    gameServer: process.argv[7],
});
