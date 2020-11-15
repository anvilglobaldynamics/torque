const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');
const { OutletMixin } = require('./mixins/outlet-mixin');

exports.EditOutletApi = class extends Api.mixin(OutletMixin) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      outletId: Joi.number().max(999999999999999).required(),

      name: Joi.string().min(1).max(64).required(),
      physicalAddress: Joi.string().min(1).max(128).required(),
      phone: Joi.string().min(1).max(64).required(), // is actually an arbitrary string, not just a phone number
      contactPersonName: Joi.string().min(1).max(64).required(),
      location: Joi.object().keys({
        lat: Joi.number().required(),
        lng: Joi.number().required()
      }).allow(null).required(),
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
    let res = await this.database.outlet.setDetails({ id: outletId }, { name, physicalAddress, phone, contactPersonName, location, categoryCode });
    this.ensureUpdate('outlet', res);
  }

  async _updateGeolocationCache({ outletId, location }) {
    let res = await this.database.cacheOutletGeolocation.setLocationByOutletId({ outletId }, { location });
    this.ensureUpdate('cache-outlet-geolocation', res);
  }

  async handle({ body }) {
    let { outletId, name, physicalAddress, phone, contactPersonName, location, categoryCode } = body;

    let categoryExists = await this.__checkIfCategoryCodeExists({ categoryCode });
    throwOnFalsy(categoryExists, "CATEGORY_INVALID", "Category code is invalid.");

    await this._updateOutlet({ outletId, name, physicalAddress, phone, contactPersonName, location, categoryCode });

    if (location) {
      let exists = await this.database.cacheOutletGeolocation._findOne({ outletId });
      if (exists) {
        await this._updateGeolocationCache({ outletId, location });
      } else {
        await this._createGeolocationCache({ outletId, location });
      }
    }

    return { status: "success" };
  }

}