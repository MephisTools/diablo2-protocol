const createSplitter = require('./splitter').createSplitter

const {compress,decompress} = require('./compression');

const ProtoDef = require('protodef').ProtoDef
const Parser = require('protodef').Parser


const protocol = require('./data/d2gs');
const protoToClient = new ProtoDef();
protoToClient.addProtocol(protocol,["toClient"]);


const parser = new Parser(protoToClient, 'packet')

const splitter = createSplitter();

splitter.write(Buffer.from('057a09a5f0','hex'))
splitter.write(Buffer.from('f105175fb9e8c85a1c8b0348e5fff0437e64ac5d0ccd9d0df7e044d1feebddee12ee132e136e13ae7ee109dc9370f26a205c996847b8916850b41cc02bf09d683687aefde7d28e894712901a444487213976c50c7605a190692243909cb8235f852080903abf7265b6db6c3abf88f6db6db185dddef7777f7777bbeeef777bbbe4a43f79951d1c8e5c6a47347bf73460d0783560d09268ff734f30347243f41734dfffe1c1a68f981a155afffc3eff901d6f3bf901202b6b7fadf901203fadffffadfeb6b7fff31bf189f9cca272e060e57239c9f05c7281a3961ce912d0ccf3a3082b79d18c10bce4c85a3a3319159a40aa0239a3f34ad8cb0ba2907a0b10ae0224a0d288',"hex"))

splitter.on('data', data => {

  console.log("here is the splitted data", data)

  console.log("decompressed data", decompress(data))

  if(data[0] !== 0x7A)
    parser.write(decompress(data))
}

);

parser.on('data', packet => {
  console.log('packet', packet)
  console.log('packet', packet.data.params.szname)
})