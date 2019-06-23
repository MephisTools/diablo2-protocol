const version = '1.14.3.71'
const crypto = require('crypto')

function checkRevision (value) {
  let bytes = Buffer.concat([Buffer.from(value, 'base64').slice(0, 4),
    Buffer.from(':' + version + ':', 'ascii'),
    Buffer.from([1])])

  const shasum = crypto.createHash('sha1')
  shasum.update(bytes)
  const hash = shasum.digest()
  var b64Hash = hash.toString('base64')
  var checksum = Buffer.from(b64Hash.slice(0, 4), 'ascii').readInt32LE()
  var info = b64Hash.slice(4)
  return { checksum, info }
}

module.exports = checkRevision
