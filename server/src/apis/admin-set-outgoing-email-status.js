
const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');

exports.AdminSetOutgoingEmailStatusApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get authenticationLevel() { return 'admin'; }

  get requestSchema() {
    return Joi.object().keys({
      apiKey: Joi.string().length(64).required(),
      status: Joi.string().valid('pending', 'sent', 'delivered', 'canceled').required(),
      outgoingEmailId: Joi.number().max(999999999999999).required()
    });
  }

  async _updateOutgoingEmailStatus({ status, outgoingEmailId }) {
    let res = await this.database.outgoingEmail.setStatus({ id: outgoingEmailId }, { status });
    throwOnFalsy(res, "OUTGOING_EMAIL_INVALID", "Invalid outgoing email provided");
  }

  async handle({ body }) {
    let { status, outgoingEmailId } = body;
    await this._updateOutgoingEmailStatus({ status, outgoingEmailId });
    return { status: 'success' };
  }

}