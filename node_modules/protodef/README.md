# ProtoDef
[![NPM version](https://img.shields.io/npm/v/protodef.svg)](http://npmjs.com/package/protodef)
[![Join the chat at https://gitter.im/ProtoDef-io/node-protodef](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/ProtoDef-io/node-protodef?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Build Status](https://img.shields.io/circleci/project/ProtoDef-io/node-protodef/master.svg)](https://circleci.com/gh/ProtoDef-io/node-protodef)
[![Tonic](https://img.shields.io/badge/tonic-try%20it-blue.svg)](https://tonicdev.com/npm/protodef)

This is a node.js module to simplify defining, reading and writing binary blobs,
whether they be internet protocols or files.

## Installing

```
npm install ProtoDef
```


## Usage

See [example](example.js)

## Documentation

See the language independent [ProtoDef](https://github.com/ProtoDef-io/ProtoDef) specification.

* [api.md](doc/api.md) documents the exposed functions and classes
* [datatypes.md](https://github.com/ProtoDef-io/ProtoDef/blob/master/doc/datatypes.md) documents the default datatypes provided by Protodef.
* [newDatatypes.md](doc/newDatatypes.md) explains how to create new datatypes for protodef
* [history.md](doc/history.md) is the releases history

## Projects Using ProtoDef

* [minecraft-protocol](https://github.com/PrismarineJS/node-minecraft-protocol) defines a protocol.json by minecraft version and use ProtoDef to serialize and parse packets
  * the protocol.json files are stored in [minecraft-data](https://github.com/PrismarineJS/minecraft-data/blob/master/data/1.8/protocol.json)
  * and they can be visualized automatically in this [doc](http://prismarinejs.github.io/minecraft-data/?d=protocol)
* [prismarine-nbt](https://github.com/PrismarineJS/prismarine-nbt) defined a nbt.json to parse and serialize the NBT format
* [mineflayer](https://github.com/PrismarineJS/mineflayer/blob/master/lib/plugins/command_block.js) uses ProtoDef to parse plugin messages
* [minecraft-protocol-forge](https://github.com/PrismarineJS/node-minecraft-protocol-forge) parses and serialize forge plugin messages
* [node-raknet](https://github.com/mhsjlw/node-raknet) describe the raknet protocol in a protocol.json and uses ProtoDef to read it
* [minecraft-classic-protocol](https://github.com/mhsjlw/minecraft-classic-protocol) defines the classic minecraft protocol with ProtoDef
* [pocket-minecraft-protocol](https://github.com/mhsjlw/pocket-minecraft-protocol) defines the minecraft pocket edition protocol
 
