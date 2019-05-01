
const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');

exports.AdminSetOutgoingSmsStatusApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get authenticationLevel() { return 'admin'; }

  get requestSchema() {
    return Joi.object().keys({
      apiKey: Joi.string().length(64).required(),
      status: Joi.string().valid('pending', 'sent', 'delivered', 'canceled').required(),
      outgoingSmsId: Joi.number().max(999999999999999).required()
    });
  }

  async _updateOutgoingSmsStatus({ status, outgoingSmsId }) {
    let res = await this.database.outgoingSms.setStatus({ id: outgoingSmsId }, { status });
    throwOnFalsy(res, "OUTGOING_SMS_INVALID", "Invalid outgong sms provided");
  }

  async handle({ body }) {
    let { status, outgoingSmsId } = body;
    await this._updateOutgoingSmsStatus({ status, outgoingSmsId });
    return { status: 'success' };
  }

}