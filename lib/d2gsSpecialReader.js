module.exports = {
  'subtractor': [readSubtractor, writeSubtractor, sizeOfSubtractor]
}

function readSubtractor (buffer, offset, { type, difference }) {
  const { value, size } = this.read(buffer, offset, type, {})
  return {
    value: value - difference,
    size
  }
}

function writeSubtractor (value, buffer, offset, { type, difference }) {
  return this.write(value + difference, buffer, offset, type, {})
}

function sizeOfSubtractor (value, { type }) {
  this.sizeOf(value, type, {})
}
