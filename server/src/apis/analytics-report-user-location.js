
const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');
const { OrganizationMixin } = require('./mixins/organization-mixin');

exports.AnalyticsReportUserLocationApi = class extends Api.mixin(OrganizationMixin) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({

      location: Joi.object().keys({
        lat: Joi.number().required(),
        lng: Joi.number().required()
      }).required(),

      action: Joi.string().min(1).max(32).valid('homepage-after-login').required(),

    });
  }

  async _updateGeolocationCache({ outletId, location }) {
    let res = await this.database.cacheOutletGeolocation.setLocationByOutletId({ outletId }, { location });
    this.ensureUpdate('cache-outlet-geolocation', res);
  }

  async _updateOutletLocation({ userId, location }) {
    let employmentList = await this.database.employment.listActiveEmploymentsOfUser({ userId });
    if (employmentList.length !== 1) {
      // Something went wrong and this is not supposed to happen.
      throw new CodedError("EMPLOYMENT_INVALID", "Employment is invalid");
    }

    let organizationId = employmentList[0].organizationId;

    let outletList = await this.database.outlet._find({ organizationId, originApp: 'torque-lite' });

    if (outletList.length !== 1) {
      throw new CodedError("OUTLET_INVALID", "Outlet is invalid");
    }

    let outlet = outletList[0];

    outlet.location = location;
    let res = await this.database.outlet.setDetails({ id: outlet.id }, outlet);
    this.ensureUpdate(res, 'outlet');

    await this._updateGeolocationCache({ outletId: outlet.id, location });
  }

  async handle({ body, userId }) {

    let { location, action } = body;

    await this.database.userLocation.create({ userId, location, action, originApp: this.clientApplication });

    if (action === 'homepage-after-login' && this.clientApplication === 'torque-lite') {
      await this._updateOutletLocation({ userId, location });
    }

    return { status: "success" };
  }

}