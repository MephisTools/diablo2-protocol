function inject (bot) {
  bot.pickupItems = () => { // TODO: queue pickup list to catch'em all
    bot.inventory = []
    bot._client.on('D2GS_ITEMACTIONWORLD', ({ unknown2 }) => {
      bot._client.write('D2GS_RUNTOENTITY', {
        entityType: 4,
        entityId: unknown2[1] // 2nd element seems to be the id
      })
      bot._client.write('D2GS_PICKUPITEM', { // Possible action IDs: 0x00 - Move item to inventory 0x01 - Move item to cursor buffer
        unitType: 4,
        unitId: unknown2[1]
      })
      bot._client.once('D2GS_REMOVEOBJECT', ({ unitType, unitId }) => { // Maybe its not optimal ? (not sure it's me who picked it)
        bot.inventory.push({ unitType, unitId })
      })
      /*
        D2GS_PICKUPITEM {"unitType":4,"unitId":52,"actionId":0}
        d2gsToClient :  D2GS_REMOVEOBJECT {"unitType":4,"unitId":52}
        d2gsToClient :  D2GS_ITEMACTIONWORLD {"entityType":4,"unknown2":[5,52,0,0,0,16,0,128,0,101,0,82,242,6,199,6,130,128,32,16,128,192,127]}
        */
    })

    // toclient D2GS_ITEMACTIONWORLD {"unknown1":0,"unknown2":[16,86,0,0,0,16,32,160,0,101,204,101,2,8,227,140,141,12,196,0,0]}
    // toserver D22GS_RUNTOENTITY {"entityType":4,"entityId":86}
    // toserver D2GS_PICKUPITEM {"unitType":4,"unitId":86,"actionId":0}
  }
}

module.exports = inject
