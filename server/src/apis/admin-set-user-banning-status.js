
const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');

exports.AdminSetUserBanningStatusApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get authenticationLevel() { return 'admin'; }

  get requestSchema() {
    return Joi.object().keys({
      apiKey: Joi.string().length(64).required(),
      isBanned: Joi.boolean().required(),
      userId: Joi.number().max(999999999999999).required(),
    });
  }

  async _updateUserBanningStatus({ isBanned, userId }) {
    let result = await this.database.user.setBanningStatus({ id: userId }, { isBanned });
    this.ensureUpdate('user', result);
    await this.database.sesssion.expireByUserId({ userId });
  }

  async handle({ body }) {
    let { isBanned, userId } = body;
    await this._updateUserBanningStatus({ isBanned, userId });
    return { status: 'success' };
  }

}