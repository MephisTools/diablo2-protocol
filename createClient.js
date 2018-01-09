const Client = require('./client');

const fs = require('fs');

const crypto = require('crypto');

const getMpq = require('./getMpq');


function createClient({host, port}) {
  const client = new Client({host, port});
  const key1 = fs.readFileSync('./key1');
  const key2 = fs.readFileSync('./key2');

  client.on('connect', () => {
    //'connect' listener
    console.log('connected to server!');
    //client.write('world!\r\n');

    client.socket.write(Buffer.from("01","hex")); // Initialises a normal logon conversation

    client.platformId = 1230518326;
    client.productId = 1144150096;

    client.write('SID_AUTH_INFO', {
      protocolId: 0,
      platformCode: client.platformId,
      productCode: client.productId,
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


  function writeAuthCheck() {
    client.write("SID_AUTH_CHECK",{
      "clientToken": 1520917560,
      "exeVersion": 16780544,
      "exeHash": 1666909528,
      "numberOfCDKeys": 2,
      "spawnKey": 0,
      "cdKeys": [
        {
          "keyLength": 26,
          "keyProductValue": 24,
          "keyPublicValue": 10916470,
          "unknown": 0,
          "hashedKeyData": key1
        },
        {
          "keyLength": 26,
          "keyProductValue": 25,
          "keyPublicValue": 6187878,
          "unknown": 0,
          "hashedKeyData": key2
        }
      ],
      "exeInformation": "Game.exe 10/18/11 20:48:14 65536",
      "keyOwnerName": "sonlight"
    });
  }


  client.on("SID_AUTH_INFO",({logonType,serverToken,udpValue,mpqFiletime,mpqFilename,valuestring}) => {
    getMpq(host, port, mpqFiletime, mpqFilename, client.platformId, client.productId, writeAuthCheck);
  });



  client.on('SID_AUTH_CHECK',({result,additionalInformation}) => {
    if(0 === result) {
      console.log("Correct keys");
      client.write('SID_GETFILETIME',{
        requestId:2147483652,
        unknown:0,
        filename:"bnserver-D2DV.ini"
      });
      client.write('SID_LOGONRESPONSE2',{
        clientToken:18226750,
        serverToken:1515471831,
        passwordHash:new Buffer([ // TODO : use sha1 algorithm
          209,
          191,
          200,
          138,
          138,
          129,
          17,
          9,
          224,
          15,
          179,
          176,
          152,
          190,
          71,
          27,
          95,
          95,
          94,
          84
        ]),
        username:"urukubal"
      })
    }
  });


  client.on('SID_LOGONRESPONSE2',({status,additionalInformation}) => {
    console.log(status === 0 ? "Success" : status === 1 ? "Account doesn't exist" : status === 2 ? "Invalid password" : "Account closed");
  });


  client.connect();

  return client;
}

module.exports = createClient;