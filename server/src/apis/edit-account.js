const { Api } = require('../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('../utils/coded-error');
const { extract } = require('../utils/extract');

exports.EditAccountApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      accountId: Joi.number().max(999999999999999).required(),

      displayName: Joi.string().min(1).max(32).required(),
      note: Joi.string().allow('').max(64).required()
    });
  }

  get accessControl() {
    return [{
      organizationBy: {
        from: "account",
        query: ({ accountId }) => ({ id: accountId }),
        select: "organizationId",
        errorCode: "ACCOUNT_INVALID"
      },
      privilegeList: [
        "PRIV_MANAGE_ACCOUNTING"
      ],
      moduleList: [
        "MOD_ACCOUNTING",
      ]
    }];
  }

  async _updateAccount({ accountId, displayName, note }) {
    let result = await this.database.account.setDetails({ id: accountId }, { displayName, note });
    this.ensureUpdate(result, 'account');
    return;
  }

  async handle({ body }) {
    let { accountId, displayName, note } = body;
    await this._updateAccount({ accountId, displayName, note });
    return { status: "success" };
  }

}