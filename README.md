# diablo2-protocol
[![NPM version](https://img.shields.io/npm/v/diablo2-protocol.svg)](http://npmjs.com/package/diablo2-protocol)
[![Build Status](https://img.shields.io/circleci/project/louis030195/diablo2-protocol/master.svg)](https://circleci.com/gh/louis030195/diablo2-protocol)


Network protocol for diablo 2.

Currently in development, almost all packets are implemented but not all packets have been tested

Follow bot in 6 lines of code

```js
clientDiablo.on('D2GS_PLAYERMOVE', ({ targetX, targetY }) => {
    clientDiablo.write('D2GS_WALKTOLOCATION', {
    xCoordinate: targetX,
    yCoordinate: targetY
    })
})  
```

## Installation

```
npm install diablo2-protocol
```

## Usage

See docs/API.md

Follow bot example

```
node example/bot.js myusername mypassword mycharacter mygamename mygamepassword 4
```

Sniffer (Linux / MacOS only)

```
cd example/sniffer
npm install
sudo node sniffer.js
```


## Roadmap
- [ ] Test all packets
- [x] Sniffer
- [ ] more documentation
- [ ] Proxy ?
- [ ] More examples
- [ ] Web / mobile interface

## Docs

### Diablo

* packets general description http://www.blizzhackers.cc/viewtopic.php?f=182&t=444264
* dump of a normal connection sequence http://www.blizzhackers.cc/viewtopic.php?t=406445
* index of packets https://bnetdocs.org/packet/index
* example of packet doc https://bnetdocs.org/packet/146
* basic example of packet parsing in python of a diablo2 packet https://gist.github.com/rom1504/8d2824d9d89dbd8b991b102696a1321e
* previous python implementation https://github.com/louis030195/PathOfBot/blob/56ebf61cac93f9ff65493c39c15db4aaaca6fbe5/PathOfBot.py

### Libs

* node basic client implementation https://nodejs.org/api/net.html#net_net_createconnection_options_connectlistener
* protodef js implementation doc https://github.com/ProtoDef-io/node-protodef https://github.com/ProtoDef-io/node-protodef/blob/master/doc/api.md and https://github.com/ProtoDef-io/node-protodef/blob/master/example.js
* protodef types https://github.com/ProtoDef-io/ProtoDef/blob/master/doc/datatypes.md
* nodepcap for sniffing https://github.com/node-pcap/node_pcap