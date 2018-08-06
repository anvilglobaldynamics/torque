
const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');

exports.DeleteWarehouseApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      warehouseId: Joi.number().max(999999999999999).required()
    });
  }

  get accessControl() {
    return [{
      organizationBy: {
        from: "warehouse",
        query: ({ warehouseId }) => ({ id: warehouseId }),
        select: "organizationId",
        errorCode: "WAREHOUSE_INVALID"
      },
      privileges: [
        "PRIV_MODIFY_ALL_WAREHOUSES"
      ]
    }];
  }

  async __ensureWarehouseIsEmpty({ warehouseId }) {
    let inventoryList = await this.database.inventory.listByInventoryContainerId({ inventoryContainerId: warehouseId, inventoryContainerType: 'warehouse' });
    let isEmpty = inventoryList.every(inventory => inventory.productList.length === 0);
    throwOnFalsy(isEmpty, "WAREHOUSE_NOT_EMPTY", "Unable to delete warehouse. The warehouse is not empty.");
  }

  async handle({ body }) {
    let { warehouseId } = body;
    await this.__ensureWarehouseIsEmpty({ warehouseId });
    let results = await this.database.warehouse.deleteById({ id: warehouseId });
    throwOnFalsy(results, "UNABLE_TO_DELETE_WAREHOUSE", "Unable to delete warehouse.");
    results = await this.database.inventory.deleteAllByInventoryContainerId({ inventoryContainerId: warehouseId, inventoryContainerType: 'warehouse' });
    throwOnFalsy(results, "UNABLE_TO_DELETE_WAREHOUSE", "Unable to delete warehouse.");
    return { status: 'success' };
  }

}