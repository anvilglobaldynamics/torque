
const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');

exports.AdminSetUserOriginTypeApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get authenticationLevel() { return 'admin'; }

  get requestSchema() {
    return Joi.object().keys({
      apiKey: Joi.string().length(64).required(),
      originType: Joi.string().valid('real', 'test', 'unsure').required(),
      userId: Joi.number().max(999999999999999).required(),
    });
  }

  async _updateUserOriginType({ originType, userId }) {
    let result = await this.database.user.setOriginType({ id: userId }, { originType });
    this.ensureUpdate('user', result);
    await this.database.session.expireByUserId({ userId });
  }

  async handle({ body }) {
    let { originType, userId } = body;
    await this._updateUserOriginType({ originType, userId });
    return { status: 'success' };
  }

}