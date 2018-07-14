'use strict'

const [readLu8, writeLu8] = require('protodef').types.lu8
const Transform = require('readable-stream').Transform

module.exports.createSplitter = function () {
  return new Splitter()
}

module.exports.createFramer = function () {
  return new Framer()
}

class Framer extends Transform {
  _transform (chunk, enc, cb) {
    const buffer = Buffer.alloc(1 + chunk.length)
    writeLu8(chunk.length, buffer, 0)
    chunk.copy(buffer, 1)
    this.push(buffer)
    return cb()
  }
}


class Splitter extends Transform {
  constructor () {
    super()
    this.buffer = Buffer.alloc(0)
  }
  _transform (chunk, enc, cb) {
    this.buffer = Buffer.concat([this.buffer, chunk])

    let offset = 0
    let value, size
    let stop = false
    try {
      ({value, size} = readLu8(this.buffer, offset))
    } catch (e) {
      if (!(e.partialReadError)) {
        throw e
      } else { stop = true }
    }
    if (!stop) {
      while (this.buffer.length >= offset + size + value) {
        try {
          this.push(this.buffer.slice(offset + size, offset + size + value))
          offset += size + value;
          ({value, size} = readLu8(this.buffer, offset))
        } catch (e) {
          if (e.partialReadError) {
            break
          } else { throw e }
        }
      }
    }
    this.buffer = this.buffer.slice(offset)
    return cb()
  }
}