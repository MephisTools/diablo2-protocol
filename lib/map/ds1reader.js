const protodef = require('protodef')
const ds1 = require('../data/ds1.json')
const fs = require('fs')
/*
    count version
     14 12
     36 13
     15 15
    229 16
    139 17
   1331 18
      1 3
      6 8

*/
const ProtoDef = protodef.ProtoDef
const proto = new ProtoDef(false)
proto.addTypes(ds1.types)

function one () {
  const ds1File = fs.readFileSync('/mnt/sdb/vms/share/archivemaphack/data/global/tiles/ACT1/BARRACKS/barE.ds1')

  console.log(proto.parsePacketBuffer('ds1', ds1File).data)
}

one()

function list () {
  const files = fs.readFileSync('/tmp/files.txt', 'utf8').split('\n')

  files.forEach(file => {
    if (file === '') {
      return
    }
    const ds1File = fs.readFileSync(file)

    console.log(proto.parsePacketBuffer('ds1', ds1File).data)
  })
}
list()
