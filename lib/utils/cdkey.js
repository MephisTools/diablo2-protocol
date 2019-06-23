/* global System, Demo */

const Bridge = require('bridge.net')

Bridge.assembly('Demo', function ($asm, globals) {
  'use strict'

  Bridge.define('Demo.BattleNet.CdKey', {
    statics: {
      fields: {
        alphaMap: null
      },
      ctors: {
        init: function () {
          this.alphaMap = System.Array.init([
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            0,
            255,
            1,
            255,
            2,
            3,
            4,
            5,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            6,
            7,
            8,
            9,
            10,
            11,
            12,
            255,
            13,
            14,
            255,
            15,
            16,
            255,
            17,
            255,
            18,
            255,
            19,
            255,
            20,
            21,
            22,
            255,
            23,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            6,
            7,
            8,
            9,
            10,
            11,
            12,
            255,
            13,
            14,
            255,
            15,
            16,
            255,
            17,
            255,
            18,
            255,
            19,
            255,
            20,
            21,
            22,
            255,
            23,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255,
            255
          ], System.Byte)
        }
      },
      methods: {
        ConvertToHexDigit: function (byt) {
          byt = byt.and(System.UInt64(15))
          if (byt.lt(System.UInt64(10))) {
            return System.Int64.clipu16(byt.add(System.UInt64(48)))
          } else {
            return System.Int64.clipu16(byt.add(System.UInt64(55)))
          }
        },
        ConvertFromHexDigit: function (input) {
          if (input >= 48 && input <= 57) {
            return Bridge.Int.clipu64(((input - 48) | 0))
          } else {
            return Bridge.Int.clipu64(((input - 55) | 0))
          }
        },
        GetD2KeyHash: function (cdkey, clientToken, serverToken, output, publicValue) {
          var checksum = System.UInt64(0)
          var n, n2, v, v2
          var c1, c2, c

          var manipulatedKey = cdkey

          for (var i = 0; i < cdkey.length; i = (i + 2) | 0) {
            var tmpBuffer = System.String.toCharArray(manipulatedKey, 0, manipulatedKey.length)
            c1 = Demo.BattleNet.CdKey.alphaMap[System.Array.index(cdkey.charCodeAt(i), Demo.BattleNet.CdKey.alphaMap)]
            n = System.UInt64(c1).mul(System.UInt64(3))
            c2 = Demo.BattleNet.CdKey.alphaMap[System.Array.index(cdkey.charCodeAt(((i + 1) | 0)), Demo.BattleNet.CdKey.alphaMap)]
            n = System.UInt64(c2).add(System.UInt64(8).mul(n))

            if (n.gte(System.UInt64(256))) {
              n = n.sub(System.UInt64(256))
              var temp = System.UInt64(1).shl((i >> 1))
              checksum = checksum.or(temp)
            }
            n2 = n
            n2 = n2.shru(4)
            tmpBuffer[System.Array.index(i, tmpBuffer)] = Demo.BattleNet.CdKey.ConvertToHexDigit(n2)
            tmpBuffer[System.Array.index(((i + 1) | 0), tmpBuffer)] = Demo.BattleNet.CdKey.ConvertToHexDigit(n)

            manipulatedKey = System.String.fromCharArray(tmpBuffer)
          }

          v = System.UInt64(3)

          for (var i1 = 0; i1 < 16; i1 = (i1 + 1) | 0) {
            n = Demo.BattleNet.CdKey.ConvertFromHexDigit(manipulatedKey.charCodeAt(i1))
            n2 = v.mul(System.UInt64(2))
            n = n.xor(n2)
            v = v.add(n)
          }

          v = v.and(System.UInt64(255))
          if (v.ne(checksum)) {
            return false
          }

          for (var i2 = 15; i2 >= 0; i2 = (i2 - 1) | 0) {
            c = manipulatedKey.charCodeAt(i2)
            if (i2 > 8) {
              n = Bridge.Int.clipu64(i2).sub(System.UInt64(9))
            } else {
              n = System.UInt64(15).sub(Bridge.Int.clipu64((((8 - i2) | 0))))
            }
            n = n.and(System.UInt64(15))

            c2 = manipulatedKey.charCodeAt(System.Int64.clip32(n))
            var tmpBuffer1 = System.String.toCharArray(manipulatedKey, 0, manipulatedKey.length)
            tmpBuffer1[System.Array.index(i2, tmpBuffer1)] = c2
            tmpBuffer1[System.Array.index(System.Int64.toNumber(n), tmpBuffer1)] = c
            manipulatedKey = System.String.fromCharArray(tmpBuffer1)
          }

          v2 = System.UInt64(330078017)

          for (var i3 = 15; i3 >= 0; i3 = (i3 - 1) | 0) {
            c = String.fromCharCode(manipulatedKey.charCodeAt(i3)).toUpperCase().charCodeAt(0)
            var tmpBuffer2 = System.String.toCharArray(manipulatedKey, 0, manipulatedKey.length)
            tmpBuffer2[System.Array.index(i3, tmpBuffer2)] = c

            if (c <= 55) {
              v = v2
              c2 = System.Int64.clipu16(v.and(System.UInt64(255)))
              c2 = (c2 & (7)) & 65535
              c2 = (c2 ^ c) & 65535
              v = v.shru(3)
              tmpBuffer2[System.Array.index(i3, tmpBuffer2)] = c2
              v2 = v
            } else if (c < 65) {
              c2 = i3 & 65535
              c2 = (c2 & (1)) & 65535
              c2 = (c2 ^ c) & 65535
              tmpBuffer2[System.Array.index(i3, tmpBuffer2)] = c2
            }
            manipulatedKey = System.String.fromCharArray(tmpBuffer2)
          }

          var hexString = manipulatedKey.substr(2, 6)
          var num = System.Convert.toNumberInBase(hexString, 16, 10)

          publicValue.v = new (System.Collections.Generic.List$1(System.Byte)).$ctor1(System.BitConverter.getBytes$8(num))

          var hashData = new (System.Collections.Generic.List$1(System.Byte)).$ctor1(System.BitConverter.getBytes$8(clientToken.v))
          hashData.AddRange(System.BitConverter.getBytes$8(serverToken))

          hashData.AddRange(System.BitConverter.getBytes$8(System.Convert.toNumberInBase(manipulatedKey.substr(0, 2), 16, 10)))

          hashData.AddRange(System.BitConverter.getBytes$8(num))
          hashData.AddRange(System.BitConverter.getBytes$4(0))
          hashData.AddRange(System.BitConverter.getBytes$8(System.Convert.toNumberInBase(manipulatedKey.substr(8, 8), 16, 10)))

          output.v = Demo.BattleNet.CdKey.GetHash(hashData)

          return true
        },
        setBufferByte: function (buffer, offset, val) {
          var index = (Bridge.Int.div(offset, 4)) | 0
          var position = offset % 4
          var bitOffset = Bridge.Int.mul(8, position)
          buffer[System.Array.index(index, buffer)] = (buffer[System.Array.index(index, buffer)] & ((((((255 << bitOffset)) >>> 0) ^ 4294967295) >>> 0))) >>> 0
          buffer[System.Array.index(index, buffer)] = (buffer[System.Array.index(index, buffer)] | (((val << bitOffset) >>> 0))) >>> 0
        },
        getBufferByte: function (buffer, offset) {
          var index = (Bridge.Int.div(offset, 4)) | 0
          var position = offset % 4
          var bitOffset = Bridge.Int.mul(8, position)
          return (((((buffer[System.Array.index(index, buffer)] >>> bitOffset) & 255) >>> 0)) & 255)
        },
        CalculateHash: function (buffer) {
          var hashBuffer = System.Array.init(80, 0, System.UInt32)
          var hash, a, b, c, d, e, hashBufferOffset

          for (var i = 0; i < 16; i = (i + 1) >>> 0) {
            hashBuffer[System.Array.index(i, hashBuffer)] = buffer.v[System.Array.index((((i | 0) + 5) | 0), buffer.v)]
          }

          for (var i1 = 16; System.Int64(i1).lt(System.Int64(hashBuffer.length)); i1 = (i1 + 1) >>> 0) {
            hash = (((((hashBuffer[System.Array.index(((i1 - 16) >>> 0), hashBuffer)] ^ hashBuffer[System.Array.index(((i1 - 8) >>> 0), hashBuffer)]) >>> 0) ^ hashBuffer[System.Array.index(((i1 - 14) >>> 0), hashBuffer)]) >>> 0) ^ hashBuffer[System.Array.index(((i1 - 3) >>> 0), hashBuffer)]) >>> 0
            hashBuffer[System.Array.index(i1, hashBuffer)] = ((1 >> (((((32 - (((hash & 255) >>> 0))) >>> 0))) | 0)) | (1 << (((((hash & 255) >>> 0))) | 0))) >>> 0
          }

          a = buffer.v[System.Array.index(0, buffer.v)]
          b = buffer.v[System.Array.index(1, buffer.v)]
          c = buffer.v[System.Array.index(2, buffer.v)]
          d = buffer.v[System.Array.index(3, buffer.v)]
          e = buffer.v[System.Array.index(4, buffer.v)]

          hashBufferOffset = 0

          for (var i2 = 0; i2 < 20; i2 = (i2 + 1) >>> 0, hashBufferOffset = (hashBufferOffset + 1) >>> 0) {
            hash = (((((((((((((a << 5) >>> 0)) | (a >>> 27)) >>> 0)) + ((((((~b & d) >>> 0)) | (((c & b) >>> 0))) >>> 0))) >>> 0) + e) >>> 0) + hashBuffer[System.Array.index(hashBufferOffset, hashBuffer)]) >>> 0) + 1518500249) >>> 0
            e = d
            d = c
            c = ((b >>> 2) | (((b << 30) >>> 0))) >>> 0
            b = a
            a = hash
          }

          for (var i3 = 0; i3 < 20; i3 = (i3 + 1) >>> 0, hashBufferOffset = (hashBufferOffset + 1) >>> 0) {
            hash = ((((((((((((d ^ c) >>> 0) ^ b) >>> 0)) + e) >>> 0) + ((((((a << 5) >>> 0)) | (a >>> 27)) >>> 0))) >>> 0) + hashBuffer[System.Array.index(hashBufferOffset, hashBuffer)]) >>> 0) + 1859775393) >>> 0
            e = d
            d = c
            c = ((b >>> 2) | (((b << 30) >>> 0))) >>> 0
            b = a
            a = hash
          }

          for (var i4 = 0; i4 < 20; i4 = (i4 + 1) >>> 0, hashBufferOffset = (hashBufferOffset + 1) >>> 0) {
            hash = (((((((((((((((c & b) >>> 0)) | (((d & c) >>> 0))) >>> 0) | (((d & b) >>> 0))) >>> 0)) + e) >>> 0) + ((((((a << 5) >>> 0)) | (a >>> 27)) >>> 0))) >>> 0) + hashBuffer[System.Array.index(hashBufferOffset, hashBuffer)]) >>> 0) - 1894007588) >>> 0
            e = d
            d = c
            c = ((b >>> 2) | (((b << 30) >>> 0))) >>> 0
            b = a
            a = hash
          }

          for (var i5 = 0; i5 < 20; i5 = (i5 + 1) >>> 0, hashBufferOffset = (hashBufferOffset + 1) >>> 0) {
            hash = (((((((((((((a << 5) >>> 0)) | (a >>> 27)) >>> 0)) + e) >>> 0) + (((((d ^ c) >>> 0) ^ b) >>> 0))) >>> 0) + hashBuffer[System.Array.index(hashBufferOffset, hashBuffer)]) >>> 0) - 899497514) >>> 0
            e = d
            d = c
            c = ((b >>> 2) | (((b << 30) >>> 0))) >>> 0
            b = a
            a = hash
          }

          buffer.v[System.Array.index(0, buffer.v)] = (buffer.v[System.Array.index(0, buffer.v)] + a) >>> 0
          buffer.v[System.Array.index(1, buffer.v)] = (buffer.v[System.Array.index(1, buffer.v)] + b) >>> 0
          buffer.v[System.Array.index(2, buffer.v)] = (buffer.v[System.Array.index(2, buffer.v)] + c) >>> 0
          buffer.v[System.Array.index(3, buffer.v)] = (buffer.v[System.Array.index(3, buffer.v)] + d) >>> 0
          buffer.v[System.Array.index(4, buffer.v)] = (buffer.v[System.Array.index(4, buffer.v)] + e) >>> 0
        },
        GetHash: function (input) {
          var buffer = { v: System.Array.init(21, 0, System.UInt32) }
          buffer.v[System.Array.index(0, buffer.v)] = 1732584193
          buffer.v[System.Array.index(1, buffer.v)] = 4023233417
          buffer.v[System.Array.index(2, buffer.v)] = 2562383102
          buffer.v[System.Array.index(3, buffer.v)] = 271733878
          buffer.v[System.Array.index(4, buffer.v)] = 3285377520

          var maxSubsectionLength = 64
          var initializedLength = 20

          for (var i = 0; System.Int64(i).lt(System.Int64(input.Count)); i = (i + maxSubsectionLength) >>> 0) {
            var subsectionLength = Math.min(maxSubsectionLength, ((((input.Count) >>> 0) - i) >>> 0))

            if (subsectionLength > maxSubsectionLength) {
              subsectionLength = maxSubsectionLength
            }

            for (var j = 0; j < subsectionLength; j = (j + 1) >>> 0) {
              var temp = System.Array.init(input.Count, 0, System.Byte)
              input.CopyTo(temp)
              Demo.BattleNet.CdKey.setBufferByte(buffer.v, ((((initializedLength + j) >>> 0)) | 0), temp[System.Array.index(((((j + i) >>> 0)) | 0), temp)])
            }

            if (subsectionLength < maxSubsectionLength) {
              for (var j1 = subsectionLength; j1 < maxSubsectionLength; j1 = (j1 + 1) >>> 0) {
                Demo.BattleNet.CdKey.setBufferByte(buffer.v, ((((initializedLength + j1) >>> 0)) | 0), 0)
              }
            }

            Demo.BattleNet.CdKey.CalculateHash(buffer)
          }

          var op = new (System.Collections.Generic.List$1(System.Byte)).ctor()  // eslint-disable-line
          for (var i1 = 0; System.Int64(i1).lt(System.Int64(buffer.v.length)); i1 = (i1 + 1) >>> 0) {
            for (var j2 = 0; j2 < 4; j2 = (j2 + 1) >>> 0) {
              op.add(Demo.BattleNet.CdKey.getBufferByte(buffer.v, ((((Bridge.Int.umul(i1, 4) + j2) >>> 0)) | 0)))
            }
          }
          return new (System.Collections.Generic.List$1(System.Byte)).$ctor1(op.GetRange(0, 20))
        }
      }
    }
  })
})

function cdKey (cdkey, clientToken, serverToken) {
  let result
  Bridge.assembly('Demo', function ($asm, globals) {
    'use strict'
    Bridge.init(function () {
      const output = {}
      const publicValue = {}
      Demo.BattleNet.CdKey.GetD2KeyHash(cdkey, { v: clientToken }, serverToken, output, publicValue)

      result = {
        output: Buffer.from(System.BitConverter.toString(output.v.ToArray()).replace(/-/g, ''), 'hex'),
        publicValue: Buffer.from(System.BitConverter.toString(publicValue.v.ToArray()).replace(/-/g, ''), 'hex')
      }
    })
  })
  return result
}

module.exports = cdKey
