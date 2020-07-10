
const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');

exports.AdminGetOutgoingSmsListApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get authenticationLevel() { return 'admin'; }

  get requestSchema() {
    return Joi.object().keys({
      apiKey: Joi.string().length(64).required(),
      date: Joi.number().max(999999999999999).required(),
      phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(4).max(14).allow(null).required(),
    });
  }

  async _getOutgoingSmsList({ date }) {
    let fromDate = new Date(date).getTime();
    let toDate = new Date(date);
    toDate.setHours(toDate.getHours() + 24);
    toDate = toDate.getTime();
    return await this.database.outgoingSms.listByDateRange({ fromDate, toDate });
  }

  async handle({ body }) {
    let { date, phone } = body;
    let outgoingSmsList = [];

    if (phone) {
      // If phone is provided, date parameter is ignored
      outgoingSmsList = await this.database.outgoingSms._find({ to: phone });
    } else {
      if (date === 1592697600000) {
        // June 21, 2020
        // On this day we upgraded all torque-lite users to torque
        // We sent out phone verification requests to all 5000 users
        // So, this date is skipped so that admin client is not overwhelmed
      } else {
        outgoingSmsList = await this._getOutgoingSmsList({ date });
      }
    }

    return { outgoingSmsList };
  }

}