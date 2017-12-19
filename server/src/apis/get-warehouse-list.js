let { Api } = require('./../api-base');
let Joi = require('joi');

exports.GetWarehouseListApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),

      organizationId: Joi.number().max(999999999999999).required()
    });
  }

  _getWarehouseList(organizationId, cbfn) {
    this.database.warehouse.listByOrganizationId({ organizationId }, (err, warehouseList) => {
      if (err) return this.fail(err);
      cbfn(warehouseList);
    })
  }

  handle({ body }) {
    let { organizationId } = body;
    this._getWarehouseList(organizationId, (warehouseList) => {
      this.success({ warehouseList });
    });
  }

}