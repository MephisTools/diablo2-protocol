const Client = require('./client');

function createClient(options) {
  const client = new Client(options);


  client.on('connect', () => {
    //'connect' listener
    console.log('connected to server!');
    //client.write('world!\r\n');

    client.socket.write(Buffer.from("01","hex")); // Initialises a normal logon conversation

    client.write('SID_AUTH_INFO', {
      protocolId: 0,
      platformCode: 1230518326,
      productCode: 1144150096,
      versionByte: 13,
      languageCode: 1701729619,
      localIp: 587311296,
      timeZoneBias: 4294967236,
      mpqLocaleId: 1036,
      userLanguageId: 1033,
      countryAbreviation: 'FRA',
      country: 'France'
    }); // http://www.bnetdocs.org/?op=packet&pid=279 SID_AUTH_INFO
  });

  client.on('SID_PING',({pingValue}) => {
    console.log("I received a ping of ping",pingValue);
    client.write('SID_PING',{
      pingValue
    })
  });


  client.socket.write(Buffer.from("02","hex")); // This initialises a BNFTP file download conversation


  client.on('SID_AUTH_INFO', ({mpqLocaleId}) => {
    console.log("Downloading mpq : ",mpqLocaleId);
    client.write('SID_AUTH_INFO',{
      mpqLocaleId
    })
  });






  client.connect();

  return client;
}

module.exports = createClient;