let { Api } = require('./../api-base');
let Joi = require('joi');

exports.DeleteWarehouseApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),
      warehouseId: Joi.number().max(999999999999999).required(),
    });
  }

  _deleteWarehouse({ warehouseId }, cbfn) {
    this.database.warehouse.delete({ warehouseId }, (err, wasUpdated) => {
      if (err) return this.fail(err);
      if (!wasUpdated) return this.fail(new Error('Unable to find warehouse to update'));
      return cbfn();
    });
  }

  handle({ body, userId }) {
    let { warehouseId } = body;
    this._deleteWarehouse({ warehouseId }, _ => {
      this.success({ status: "success" });
    });
  }

}