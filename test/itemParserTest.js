/* eslint-env mocha */

const { itemParser } = require('..')
const assert = require('assert')

describe('itemParser', () => {
  it('parsesCorrectly item without properties', () => {
    const buffer1 = Buffer.from('9d1319103c00000004390000001800a0006518042007730302', 'hex')
    const expected = {
      'action': 19,
      'category': 25,
      'id': 60,
      'equipped': 0,
      'in_socket': 1,
      'identified': 1,
      'switched_in': 0,
      'switched_out': 0,
      'broken': 0,
      'potion': 0,
      'has_sockets': 0,
      'in_store': 0,
      'not_in_a_socket': 0,
      'ear': 0,
      'start_item': 0,
      'simple_item': 1,
      'ethereal': 0,
      'personalised': 0,
      'gambling': 0,
      'rune_word': 0,
      'version': 101,
      'ground': false,
      'directory': 0,
      'x': 2,
      'y': 0,
      'container': 64,
      'unspecified_directory': false,
      'type': 'r07',
      'name': 'Tal Rune',
      'width': '1',
      'height': '1',
      'throwable': '0',
      'stackable': '0',
      'usable': '0',
      'is_armor': false,
      'is_weapon': false,
      'quality': 2
    }

    const actual = itemParser(buffer1)

    assert.deepStrictEqual(actual, expected)
  })

  it('parsesCorrectly item with properties', () => {
    const buffer2 = Buffer.from('9d0630103700000000010000001100800065440410d6560782eb0d88005012a024a034a074822905d30aa6164c7ff41f', 'hex')

    const expected = {
      'action': 6,
      'category': 48,
      'id': 55,
      'equipped': 1,
      'in_socket': 0,
      'identified': 1,
      'switched_in': 0,
      'switched_out': 0,
      'broken': 0,
      'potion': 0,
      'has_sockets': 0,
      'in_store': 0,
      'not_in_a_socket': 0,
      'ear': 0,
      'start_item': 0,
      'simple_item': 0,
      'ethereal': 0,
      'personalised': 0,
      'gambling': 0,
      'rune_word': 0,
      'version': 101,
      'ground': false,
      'directory': 2,
      'x': 2,
      'y': 0,
      'container': 0,
      'unspecified_directory': true,
      'type': 'amu',
      'name': 'Amulet',
      'width': '1',
      'height': '1',
      'throwable': '0',
      'stackable': '0',
      'usable': '0',
      'is_armor': false,
      'is_weapon': false,
      'quality': 13,
      'level': 56,
      'has_graphic': 1,
      'graphic': 5,
      'has_colour': 1,
      'colour': 128,
      'amount': 146,
      'properties': [
        {
          'stat': 'progressive_other',
          'value': 0
        },
        {
          'stat': 'minimum_magical_damage',
          'value': 80
        },
        {
          'stat': 'enhanced_defense_vs_monsters',
          'value': 0
        },
        {
          'stat': 'faster_run_walk',
          'value': 17
        },
        {
          'stat': 'unused_193',
          'value': 0
        },
        {
          'stat': 'thrown_weapon_damage_mastery',
          'value': 96
        }
      ]
    }

    const actual = itemParser(buffer2)

    assert.deepStrictEqual(actual, expected)
  })
})
