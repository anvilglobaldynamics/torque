let { Api } = require('./../api-base');
let Joi = require('joi');

exports.GetWarehouseApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),

      warehouseId: Joi.number().max(999999999999999).required()
    });
  }

  _getWarehouse(warehouseId, cbfn) {
    this.database.warehouse.getByWarehouseId(warehouseId, (err, warehouse) => {
      if (err) return this.fail(err);
      cbfn(warehouse);
    })
  }

  handle({ body }) {
    let { warehouseId } =  body;
    this._getWarehouse(warehouseId, (warehouse) => {
      this.success({ warehouse });
    });
  }

}