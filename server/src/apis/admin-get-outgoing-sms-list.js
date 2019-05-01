
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
      date: Joi.number().max(999999999999999).required()
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
    let { date } = body;
    let outgoingSmsList = await this._getOutgoingSmsList({ date });
    return { outgoingSmsList };
  }

}