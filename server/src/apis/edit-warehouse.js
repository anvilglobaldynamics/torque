let { Api } = require('./../api-base');
let Joi = require('joi');

exports.EditWarehouseApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),
      warehouseId: Joi.number().max(999999999999999).required(),

      name: Joi.string().min(1).max(64).required(),
      physicalAddress: Joi.string().min(1).max(128).required(),
      phone: Joi.string().alphanum().min(11).max(14).required(),
      contactPersonName: Joi.string().min(1).max(64).required()
    });
  }

  _updateWarehouse({ warehouseId, name, physicalAddress, phone, contactPersonName }, cbfn) {
    this.database.warehouse.update({ warehouseId }, { name, physicalAddress, phone, contactPersonName }, (err, wasUpdated) => {
      if (err) return this.fail(err);
      if (!wasUpdated) return this.fail(new Error('Unable to find warehouse to update'));
      return cbfn();
    });
  }

  handle({ body, userId }) {
    let { warehouseId, name, physicalAddress, phone, contactPersonName } = body;
    this._updateWarehouse({ warehouseId, name, physicalAddress, phone, contactPersonName }, _ => {
      this.success({ status: "success" });
    });
  }

}