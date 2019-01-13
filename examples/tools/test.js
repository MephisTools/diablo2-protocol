const Reader = require('bitset-reader')

const buffer = Buffer.from('9d1319103c00000004390000001800a0006518042007730302', 'hex')

function toArrayBuffer (buf) {
  const ab = new ArrayBuffer(buf.length)
  const view = new Uint8Array(ab)
  for (let i = 0; i < buf.length; ++i) {
    view[i] = buf[i]
  }
  return ab
}

const reader = new Reader(buffer)

const bb = require('bit-buffer')

bb.bigEndian = false

const { BitStream } = bb

BitStream.bigEndian = false

const stream = new BitStream(toArrayBuffer(buffer))
stream.bigEndian = false

console.log('mine', reader.read(8))
console.log('mine', reader.read(8))

console.log('theirs', stream.readBits(8, false))

console.log('theirs', stream.readBits(8, false))