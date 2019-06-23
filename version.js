'use strict'

function toNumVersion (version) {
  switch (version) {
    case '1.13':
      return 13
    case '1.14':
      return 14
  }
}

module.exports = {
  defaultVersion: '1.14',
  supportedVersions: ['1.13', '1.14'],
  toNumVersion
}
