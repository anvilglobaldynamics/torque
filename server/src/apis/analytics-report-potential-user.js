
const { Api } = require('../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('../utils/coded-error');

exports.AnalyticsReportPotentialUserApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return false; }

  get requestSchema() {
    return Joi.object().keys({
      phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(4).max(14).allow(null).required(),
      source: Joi.string().valid('torque-live-register-page').required(),
    });
  }

  async handle({ body }) {
    let { phone, source } = body;

    await this.database.potentialUser.create({
      phone, source,
      registeredUserId: null
    });

    return {};
  }

}