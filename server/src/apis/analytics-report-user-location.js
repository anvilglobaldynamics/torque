
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

  async handle({ body, userId }) {

    let { location, action } = body;

    await this.database.userLocation.create({ userId, location, action, originApp: this.clientApplication });

    return { status: "success" };
  }

}