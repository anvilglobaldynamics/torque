
exports.inventoryCommonMixin = (SuperApiClass) => class extends SuperApiClass {

  _createInventory({ inventoryContainerId, organizationId, type, name }, cbfn) {
    let inventory = {
      inventoryContainerId, organizationId, type, name, allowManualTransfer: true
    }
    this.database.inventory.create(inventory, (err, inventoryId) => {
      if (err) return this.fail(err);
      cbfn();
    })
  }

  _createStandardInventories({ inventoryContainerId, organizationId }, cbfn) {
    this._createInventory({ inventoryContainerId, organizationId, type: 'default', name: 'Default' }, () => {
      this._createInventory({ inventoryContainerId, organizationId, type: 'returned', name: 'Returned' }, () => {
        this._createInventory({ inventoryContainerId, organizationId, type: 'damaged', name: 'Damaged' }, () => {
          cbfn();
        })
      })
    })
  }



}