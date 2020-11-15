let { LegacyApi } = require('./../legacy-api-base');
let Joi = require('joi');

let { inventoryCommonMixin } = require('./mixins/inventory-common');

exports.AddWarehouseApi = class extends inventoryCommonMixin(LegacyApi) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),

      name: Joi.string().min(1).max(64).required(),
      organizationId: Joi.number().max(999999999999999).required(),
      physicalAddress: Joi.string().min(1).max(128).required(),
      contactPersonName: Joi.string().min(1).max(64).required(),
      phone: Joi.string().min(1).max(64).required(), // is actually an arbitrary string, not just a phone number
    });
  }

  get accessControl() {
    return [{
      organizationBy: "organizationId",
      privilegeList: [
        "PRIV_MODIFY_ALL_WAREHOUSES"
      ],
      moduleList: [
        "MOD_PRODUCT",
      ]
    }];
  }

  _createWarehouse({ name, organizationId, physicalAddress, phone, contactPersonName }, cbfn) {
    let warehouse = {
      name, organizationId, physicalAddress, phone, contactPersonName
    }
    this.legacyDatabase.warehouse.create(warehouse, (err, warehouseId) => {
      if (err) return this.fail(err);
      return cbfn(warehouseId);
    });
  }

  _checkOrganizationPackageWarehouseLimit({ organizationId, aPackage }, cbfn) {
    this.legacyDatabase.warehouse.listByOrganizationId({ organizationId }, (err, warehouseList) => {
      if (err) return this.fail(err);
      if (warehouseList.length == aPackage.limits.maximumWarehouses) {
        err = new Error(this.verses.packageLimitCommon.activePackageLimitReached);
        err.code = "ORGANIZATION_PACKAGE_LIMIT_REACHED";
        return this.fail(err);
      }
      return cbfn();
    });
  }

  handle({ body }) {
    let { name, organizationId, physicalAddress, phone, contactPersonName } = body;
    let { aPackage } = this.interimData;
    this._checkOrganizationPackageWarehouseLimit({ organizationId, aPackage }, () => {
      this._createWarehouse({ name, organizationId, physicalAddress, phone, contactPersonName }, (warehouseId) => {
        this._createStandardInventories({ inventoryContainerId: warehouseId, inventoryContainerType: "warehouse", organizationId }, () => {
          this.success({ status: "success", warehouseId });
        });
      });
    });
  }

}