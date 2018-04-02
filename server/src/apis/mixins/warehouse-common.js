exports.warehouseCommonMixin = (SuperApiClass) => class extends SuperApiClass {

  _getWarehouseInventories({ warehouseId }, cbfn) {
    this.database.inventory.listByInventoryContainerId({ inventoryContainerId: warehouseId }, (err, inventoryList) => {
      let defaultInventory, returnedInventory, damagedInventory;
      inventoryList.forEach(inventory => {
        if (inventory.type === 'default') {
          let { createdDatetimeStamp, lastModifiedDatetimeStamp, id, name, allowManualTransfer } = inventory;
          defaultInventory = { createdDatetimeStamp, lastModifiedDatetimeStamp, id, name, allowManualTransfer };
        } else if (inventory.type === 'returned') {
          let { createdDatetimeStamp, lastModifiedDatetimeStamp, id, name, allowManualTransfer } = inventory;
          returnedInventory = { createdDatetimeStamp, lastModifiedDatetimeStamp, id, name, allowManualTransfer };
        } else if (inventory.type === 'damaged') {
          let { createdDatetimeStamp, lastModifiedDatetimeStamp, id, name, allowManualTransfer } = inventory;
          damagedInventory = { createdDatetimeStamp, lastModifiedDatetimeStamp, id, name, allowManualTransfer };
        }
      });
      cbfn(defaultInventory, returnedInventory, damagedInventory);
    })
  }

}