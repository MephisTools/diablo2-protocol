'use strict'

const [readLu8, writeLu8] = require('protodef').types.lu8
const Transform = require('readable-stream').Transform
const {getPacketSize} = require('./compression')

module.exports.createSplitter = function () {
  return new Splitter()
}

module.exports.createFramer = function () {
  return new Framer()
}

class Framer extends Transform {
  _transform (chunk, enc, cb) {
    const buffer = Buffer.alloc(1 + chunk.length)
    writeLu8(chunk.length+1, buffer, 0)
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
    let payloadSize, headerSize
    let stop = false
    if (this.buffer.length < 2 || (this.buffer[0] >= 0xF0 && this.buffer.length < 3))
    {
      stop = true;
    }
    else {
      ({payloadSize, headerSize} = getPacketSize(this.buffer.slice(offset)));
    }
    console.log({stop,payloadSize,headerSize, buffer: this.buffer.slice(offset).toString('hex')})

    console.log({bufferLength: this.buffer.length, offset})
    if (!stop) {
      while (this.buffer.length >= offset + payloadSize + headerSize) {
        this.push(this.buffer.slice(offset + headerSize, offset + payloadSize + headerSize))
        offset += payloadSize + headerSize;

        if (this.buffer.length - offset < 2 || (this.buffer[offset] >= 0xF0 && this.buffer.length - offset < 3))
        {
          stop = true;
        }
        else {
          ({payloadSize, headerSize} = getPacketSize(this.buffer.slice(offset)));
        }

        console.log({offset, stop,payloadSize,headerSize, buffer: this.buffer.slice(offset).toString('hex')})


      }
    }
    this.buffer = this.buffer.slice(offset)
    return cb()
  }
}