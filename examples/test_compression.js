const { compress, decompress, getPacketSize } = require('..')

let output = compress(Buffer.from([0, 0xa0]))
console.log('compressed : ' + output.toString('hex'))

let w = decompress(output)
console.log('decompressed : ' + w.toString('hex'))

console.log('size of packet :', getPacketSize(Buffer.from('067a092eef5c', 'hex')))

console.log('decompressed payload :', decompress(Buffer.from('7a092eef5c', 'hex')))

console.log('decompressed payload :', decompress(Buffer.from('2080', 'hex')))

console.log('decompressed payload :', decompress(Buffer.from('071f7fffffffc0', 'hex'))) // D2GS_COMPSTARTGAME

console.log('decompressed payload :', decompress(Buffer.from(`   f1 14 17 5f b9 54 6b 1b 8b 63 71 60 64 3d ff f0
   43 7e 64 ac 5d 0c cd 9d 0d f7 e0 45 a7 fb af 77
   b8 4b b8 4c b8 4d b8 4e b9 fb 84 27 70 ee e4 9b
   87 96 84 0b 80 0b 93 2d 08 d4 62 3d c4 8b 42 75
   c5 0b 41 d5 fb 93 2d b6 db 61 d5 fc 48 b6 db 6d
   8c 2e ee ef bb bb fb bb bd df 77 7d dd de f7 25
   21 fb cc bf 9a 9a 11 cd 1e f3 2b 9c 25 2e 0f 06
   ac 1a 12 6f f7 f9 81 a0 f0 bb de 65 76 57 5a ff
   ff 32 e3 d9 b9 94 09 1a 99 7f ff 0f bf fa da de
   77 f2 02 40 56 d6 ff 5b f2 02 40 7f 5b 5b ff ff
   d6 f5 bf ff e6 37 e3 13 f3 98 15 39 71 50 e5 72
   3a 83 e9 9c e5 01 99 cb 0e 74 8a 12 17 9d 18 43
   87 9d 18 d3 2f 39 32 18 0e 4c d7 02 a8 08 e6 8f
   cd 2b 63 2c 22 0a 41 e8 2c 42 b9 73 0d 28 80 aa
   00 dc d1 7e 69 5b 19 64 30 88 12 0d 8f ae 62 c0
   3e 90 0c 10 c3 b8 15 40 74 68 7f 9a 56 c6 58 42
   11 02 40 90 7c 79 0b 40 34 14 8e 21 80 8c 90 29
   97 41 d0 ee`.split(' ').join(''), 'hex')))

console.log('decompressed payload :', decompress(Buffer.from('0c 52 83 b8 50 4c 29 9b 3d 10 b3 60'.split(' ').join(''), 'hex')))

console.log('decompressed payload :', decompress(Buffer.from('09 58 87 80 23 51 51 32 d0'.split(' ').join(''), 'hex'))) // ping ?

console.log('decompressed payload :', decompress(Buffer.from('06 1d e5 ab f7 80'.split(' ').join(''), 'hex'))) // ping ?

console.log('decompressed payload :', decompress(Buffer.from('05 04 0e fd 70'.split(' ').join(''), 'hex'))) // ping ?
