exports.inventoryCommonMixin = (SuperApiClass) => class extends SuperApiClass {

  _getOutletDefaultInventory({ outletId }, cbfn) {
    this.legacyDatabase.inventory.listByInventoryContainerId({ inventoryContainerId: outletId, inventoryContainerType: "outlet" }, (err, inventoryList) => {
      if (err) return this.fail(err);
      if (inventoryList.length === 0) {
        err = new Error("Invalid Outlet Or Inventory could not be found");
        err.code = "OUTLET_INVENTORY_INVALID"
        return this.fail(err);
      }
      // let inventory = inventoryList.find(inventory => inventory.type === 'default');
      // let { createdDatetimeStamp, lastModifiedDatetimeStamp, id, name } = inventory;
      // let outletDefaultInventory = { createdDatetimeStamp, lastModifiedDatetimeStamp, id, name };
      let outletDefaultInventory = inventoryList.find(inventory => inventory.type === 'default');
      return cbfn(outletDefaultInventory);
    })
  }

  _getOutletReturnedInventory({ outletId }, cbfn) {
    this.legacyDatabase.inventory.listByInventoryContainerId({ inventoryContainerId: outletId, inventoryContainerType: "outlet" }, (err, inventoryList) => {
      if (err) return this.fail(err);
      if (inventoryList.length === 0) {
        err = new Error("Invalid Outlet Or Inventory could not be found");
        err.code = "OUTLET_INVENTORY_INVALID"
        return this.fail(err);
      }
      // let inventory = inventoryList.find(inventory => inventory.type === 'default');
      // let { createdDatetimeStamp, lastModifiedDatetimeStamp, id, name } = inventory;
      // let outletReturnedInventory = { createdDatetimeStamp, lastModifiedDatetimeStamp, id, name };
      let outletReturnedInventory = inventoryList.find(inventory => inventory.type === 'returned');
      return cbfn(outletReturnedInventory);
    })
  }

  _updateInventory({ inventoryId, productList }, cbfn) {
    this.legacyDatabase.inventory.updateProductList({ inventoryId }, { productList }, (err) => {
      if (err) return this.fail(err);
      cbfn();
    });
  }

  _createInventory({ inventoryContainerId, inventoryContainerType, organizationId, type, name }, cbfn) {
    let inventory = {
      inventoryContainerId, inventoryContainerType, organizationId, type, name
    }
    this.legacyDatabase.inventory.create(inventory, (err, inventoryId) => {
      if (err) return this.fail(err);
      cbfn();
    })
  }

  _deleteByInventoryContainerId({ inventoryContainerId }, cbfn) {
    this.legacyDatabase.inventory.deleteByInventoryContainerId({ inventoryContainerId }, (err) => {
      if (err) return this.fail(err);
      cbfn();
    })
  }

  _createStandardInventories({ inventoryContainerId, inventoryContainerType, organizationId }, cbfn) {
    this._createInventory({ inventoryContainerId, inventoryContainerType, organizationId, type: 'default', name: 'Default' }, () => {
      this._createInventory({ inventoryContainerId, inventoryContainerType, organizationId, type: 'returned', name: 'Returned' }, () => {
        this._createInventory({ inventoryContainerId, inventoryContainerType, organizationId, type: 'damaged', name: 'Damaged' }, () => {
          cbfn();
        })
      })
    })
  }

  _checkIfInventoryContainerIsEmpty({ inventoryContainerId }, cbfn) {
    cbfn();
  }

  _getInventoryWithId({ inventoryId }, cbfn) {
    this.legacyDatabase.inventory.findById({ inventoryId }, (err, inventory) => {
      if (!this._ensureDoc(err, inventory, "FROM_INVENTORY_INVALID", "Inventory could not be found")) return;
      cbfn(inventory);
    });
  }

  _getInventoriesByInventoryContainer({ inventoryContainerId, inventoryContainerType }, cbfn) {
    this.legacyDatabase.inventory.listByInventoryContainerId({ inventoryContainerId, inventoryContainerType }, (err, inventoryList) => {
      let defaultInventory, returnedInventory, damagedInventory;
      inventoryList.forEach(inventory => {
        if (inventory.type === 'default') {
          let { createdDatetimeStamp, lastModifiedDatetimeStamp, id, name } = inventory;
          defaultInventory = { createdDatetimeStamp, lastModifiedDatetimeStamp, id, name };
        } else if (inventory.type === 'returned') {
          let { createdDatetimeStamp, lastModifiedDatetimeStamp, id, name } = inventory;
          returnedInventory = { createdDatetimeStamp, lastModifiedDatetimeStamp, id, name };
        } else if (inventory.type === 'damaged') {
          let { createdDatetimeStamp, lastModifiedDatetimeStamp, id, name } = inventory;
          damagedInventory = { createdDatetimeStamp, lastModifiedDatetimeStamp, id, name };
        }
      });
      cbfn(defaultInventory, returnedInventory, damagedInventory);
    })
  }

}