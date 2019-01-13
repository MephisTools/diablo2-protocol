const { BitStream } = require('bit-buffer')

function toArrayBuffer (buf) {
  const ab = new ArrayBuffer(buf.length)
  const view = new Uint8Array(ab)
  for (let i = 0; i < buf.length; ++i) {
    view[i] = buf[i]
  }
  return ab
}

function toBuffer (ab) {
  const buf = Buffer.alloc(ab.byteLength)
  const view = new Uint8Array(ab)
  for (let i = 0; i < buf.length; ++i) {
    buf[i] = view[i]
  }
  return buf
}

function readBitFieldLE (buffer, offset, typeArgs) {
  const reader = new BitStream(toArrayBuffer(buffer.slice(offset)))
  const results = {}
  let length = 0
  results.value = typeArgs.reduce((acc, { size, signed, name }) => {
    acc[name] = reader.readBits(size, signed)
    length += size
    return acc
  }, {})
  results.size = length
  return results
}
function writeBitFieldLE (value, buffer, offset, typeArgs) {
  const arr = new ArrayBuffer(sizeOfBitFieldLE(value, typeArgs))
  const stream = new BitStream(arr)
  typeArgs.forEach(({ size, signed, name }) => {
    const val = value[name]
    stream.writeBits(val, size)
    offset += size
  })
  const newBuffer = toBuffer(arr)
  newBuffer.copy(buffer, offset)

  return offset
}

function sizeOfBitFieldLE (value, typeArgs) {
  return Math.ceil(typeArgs.reduce((acc, { size }) => {
    return acc + size
  }, 0) / 8)
}

module.exports = { 'bitfieldLE': [readBitFieldLE, writeBitFieldLE, sizeOfBitFieldLE] }
