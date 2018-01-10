const Bridge = require('bridge.net');

Bridge.assembly("Demo", function ($asm, globals) {
  "use strict";

  Bridge.define("Demo.BattleNet.Bsha1", {
    statics: {
      methods: {
        setBufferByte: function (buffer, offset, val) {
          var index = (Bridge.Int.div(offset, 4)) | 0;
          var position = offset % 4;
          var bit_offset = Bridge.Int.mul(8, position);
          buffer[System.Array.index(index, buffer)] = (buffer[System.Array.index(index, buffer)] & ((((((255 << bit_offset)) >>> 0) ^ 4294967295) >>> 0))) >>> 0;
          buffer[System.Array.index(index, buffer)] = (buffer[System.Array.index(index, buffer)] | (((val << bit_offset) >>> 0))) >>> 0;
        },
        getBufferByte: function (buffer, offset) {
          var index = (Bridge.Int.div(offset, 4)) | 0;
          var position = offset % 4;
          var bit_offset = Bridge.Int.mul(8, position);
          return (((((buffer[System.Array.index(index, buffer)] >>> bit_offset) & 255) >>> 0)) & 255);
        },
        CalculateHash: function (buffer) {
          var hash_buffer = System.Array.init(80, 0, System.UInt32);
          var hash, a, b, c, d, e, hash_buffer_offset;

          for (var i = 0; i < 16; i = (i + 1) >>> 0) {
            hash_buffer[System.Array.index(i, hash_buffer)] = buffer.v[System.Array.index((((i | 0) + 5) | 0), buffer.v)];
          }

          for (var i1 = 16; System.Int64(i1).lt(System.Int64(hash_buffer.length)); i1 = (i1 + 1) >>> 0) {
            hash = (((((hash_buffer[System.Array.index(((i1 - 16) >>> 0), hash_buffer)] ^ hash_buffer[System.Array.index(((i1 - 8) >>> 0), hash_buffer)]) >>> 0) ^ hash_buffer[System.Array.index(((i1 - 14) >>> 0), hash_buffer)]) >>> 0) ^ hash_buffer[System.Array.index(((i1 - 3) >>> 0), hash_buffer)]) >>> 0;
            hash_buffer[System.Array.index(i1, hash_buffer)] = ((1 >> (((((32 - (((hash & 255) >>> 0))) >>> 0))) | 0)) | (1 << (((((hash & 255) >>> 0))) | 0))) >>> 0;
          }

          a = buffer.v[System.Array.index(0, buffer.v)];
          b = buffer.v[System.Array.index(1, buffer.v)];
          c = buffer.v[System.Array.index(2, buffer.v)];
          d = buffer.v[System.Array.index(3, buffer.v)];
          e = buffer.v[System.Array.index(4, buffer.v)];

          hash_buffer_offset = 0;

          for (var i2 = 0; i2 < 20; i2 = (i2 + 1) >>> 0, hash_buffer_offset = (hash_buffer_offset + 1) >>> 0) {
            hash = (((((((((((((a << 5) >>> 0)) | (a >>> 27)) >>> 0)) + ((((((~b & d) >>> 0)) | (((c & b) >>> 0))) >>> 0))) >>> 0) + e) >>> 0) + hash_buffer[System.Array.index(hash_buffer_offset, hash_buffer)]) >>> 0) + 1518500249) >>> 0;
            e = d;
            d = c;
            c = ((b >>> 2) | (((b << 30) >>> 0))) >>> 0;
            b = a;
            a = hash;
          }

          for (var i3 = 0; i3 < 20; i3 = (i3 + 1) >>> 0, hash_buffer_offset = (hash_buffer_offset + 1) >>> 0) {
            hash = ((((((((((((d ^ c) >>> 0) ^ b) >>> 0)) + e) >>> 0) + ((((((a << 5) >>> 0)) | (a >>> 27)) >>> 0))) >>> 0) + hash_buffer[System.Array.index(hash_buffer_offset, hash_buffer)]) >>> 0) + 1859775393) >>> 0;
            e = d;
            d = c;
            c = ((b >>> 2) | (((b << 30) >>> 0))) >>> 0;
            b = a;
            a = hash;
          }

          for (var i4 = 0; i4 < 20; i4 = (i4 + 1) >>> 0, hash_buffer_offset = (hash_buffer_offset + 1) >>> 0) {
            hash = (((((((((((((((c & b) >>> 0)) | (((d & c) >>> 0))) >>> 0) | (((d & b) >>> 0))) >>> 0)) + e) >>> 0) + ((((((a << 5) >>> 0)) | (a >>> 27)) >>> 0))) >>> 0) + hash_buffer[System.Array.index(hash_buffer_offset, hash_buffer)]) >>> 0) - 1894007588) >>> 0;
            e = d;
            d = c;
            c = ((b >>> 2) | (((b << 30) >>> 0))) >>> 0;
            b = a;
            a = hash;
          }

          for (var i5 = 0; i5 < 20; i5 = (i5 + 1) >>> 0, hash_buffer_offset = (hash_buffer_offset + 1) >>> 0) {
            hash = (((((((((((((a << 5) >>> 0)) | (a >>> 27)) >>> 0)) + e) >>> 0) + (((((d ^ c) >>> 0) ^ b) >>> 0))) >>> 0) + hash_buffer[System.Array.index(hash_buffer_offset, hash_buffer)]) >>> 0) - 899497514) >>> 0;
            e = d;
            d = c;
            c = ((b >>> 2) | (((b << 30) >>> 0))) >>> 0;
            b = a;
            a = hash;
          }

          buffer.v[System.Array.index(0, buffer.v)] = (buffer.v[System.Array.index(0, buffer.v)] + a) >>> 0;
          buffer.v[System.Array.index(1, buffer.v)] = (buffer.v[System.Array.index(1, buffer.v)] + b) >>> 0;
          buffer.v[System.Array.index(2, buffer.v)] = (buffer.v[System.Array.index(2, buffer.v)] + c) >>> 0;
          buffer.v[System.Array.index(3, buffer.v)] = (buffer.v[System.Array.index(3, buffer.v)] + d) >>> 0;
          buffer.v[System.Array.index(4, buffer.v)] = (buffer.v[System.Array.index(4, buffer.v)] + e) >>> 0;
        },
        GetHash: function (input) {
          var buffer = {v: System.Array.init(21, 0, System.UInt32)};
          buffer.v[System.Array.index(0, buffer.v)] = 1732584193;
          buffer.v[System.Array.index(1, buffer.v)] = 4023233417;
          buffer.v[System.Array.index(2, buffer.v)] = 2562383102;
          buffer.v[System.Array.index(3, buffer.v)] = 271733878;
          buffer.v[System.Array.index(4, buffer.v)] = 3285377520;

          var max_subsection_length = 64;
          var initialized_length = 20;

          for (var i = 0; System.Int64(i).lt(System.Int64(input.Count)); i = (i + max_subsection_length) >>> 0) {
            var subsection_length = Math.min(max_subsection_length, ((((input.Count) >>> 0) - i) >>> 0));

            if (subsection_length > max_subsection_length) {
              subsection_length = max_subsection_length;
            }

            for (var j = 0; j < subsection_length; j = (j + 1) >>> 0) {
              var temp = System.Array.init(input.Count, 0, System.Byte);
              input.copyTo$1(temp);
              Demo.BattleNet.Bsha1.setBufferByte(buffer.v, ((((initialized_length + j) >>> 0)) | 0), temp[System.Array.index(((((j + i) >>> 0)) | 0), temp)]);
            }

            if (subsection_length < max_subsection_length) {
              for (var j1 = subsection_length; j1 < max_subsection_length; j1 = (j1 + 1) >>> 0) {
                Demo.BattleNet.Bsha1.setBufferByte(buffer.v, ((((initialized_length + j1) >>> 0)) | 0), 0);
              }
            }

            Demo.BattleNet.Bsha1.CalculateHash(buffer);

          }

          var op = new (System.Collections.Generic.List$1(System.Byte)).ctor();
          for (var i1 = 0; System.Int64(i1).lt(System.Int64(buffer.v.length)); i1 = (i1 + 1) >>> 0) {
            for (var j2 = 0; j2 < 4; j2 = (j2 + 1) >>> 0) {
              op.add(Demo.BattleNet.Bsha1.getBufferByte(buffer.v, ((((Bridge.Int.umul(i1, 4) + j2) >>> 0)) | 0)));
            }
          }
          return new (System.Collections.Generic.List$1(System.Byte)).$ctor1(op.getRange(0, 20));
        },
        DoubleHash: function (client_token, server_token, password) {
          var pv = System.Text.Encoding.UTF8.GetBytes$2(password);
          var password_hash = Demo.BattleNet.Bsha1.GetHash(new (System.Collections.Generic.List$1(System.Byte)).$ctor1(pv));


          var final_input = new (System.Collections.Generic.List$1(System.Byte)).$ctor1(System.BitConverter.getBytes$8(client_token));
          final_input.addRange(System.BitConverter.getBytes$8(server_token));
          final_input.addRange(password_hash);

          var output = Demo.BattleNet.Bsha1.GetHash(final_input);

          return output;
        }
      }
    }
  });
});

function getHash(client_token, server_token, password, cb) {
  let result;
  Bridge.assembly("Demo", function ($asm, globals) {
    "use strict";
    Bridge.init(function () {
      result = new Buffer(System.BitConverter.toString(Demo.BattleNet.Bsha1.DoubleHash(client_token, server_token, password).toArray()).replace(/-/g, ''), 'hex');
    });
  });
  return result;
}

module.exports = getHash;