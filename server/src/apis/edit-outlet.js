const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');

exports.EditOutletApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      outletId: Joi.number().max(999999999999999).required(),

      name: Joi.string().min(1).max(64).required(),
      physicalAddress: Joi.string().min(1).max(128).required(),
      phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(11).max(15).required(),
      contactPersonName: Joi.string().min(1).max(64).required(),
      location: Joi.object().keys({
        lat: Joi.number().required(),
        lng: Joi.number().required()
      }).required(),
      categoryCode: Joi.string().required()
    });
  }

  get accessControl() {
    return [{
      organizationBy: {
        from: "outlet",
        query: ({ outletId }) => ({ id: outletId }),
        select: "organizationId",
        errorCode: "OUTLET_INVALID"
      },
      privilegeList: [
        "PRIV_MODIFY_ALL_OUTLETS"
      ]
    }];
  }

  async _updateOutlet({ outletId, name, physicalAddress, phone, contactPersonName, location, categoryCode }) {
    let res = await this.database.outlet.setDetails({ id: outletId}, {name, physicalAddress, phone, contactPersonName, location, categoryCode });
    this.ensureUpdate('outlet', res);
  }

  async handle({ body }) {
    let { outletId, name, physicalAddress, phone, contactPersonName, location, categoryCode } = body;
    // TODO: check if categoryCode is valid
    await this._updateOutlet({ outletId, name, physicalAddress, phone, contactPersonName, location, categoryCode });
    return { status: "success" };
  }

}