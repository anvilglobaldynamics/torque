
const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');

exports.GetAccountListApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get autoPaginates() { return ['accountList']; }

  get requestSchema() {
    return Joi.object().keys({
      organizationId: Joi.number().max(999999999999999).required(),

      filterByNature: Joi.string().valid('all', 'asset', 'liability', 'equity', 'revenue', 'expense').required(),
      filterByIsMonetary: Joi.string().valid('all', 'only-monetary', 'exclude-monetary').required(),
      accountIdList: Joi.array().items(Joi.number()).default([]).required()
    });
  }

  get accessControl() {
    return [{
      organizationBy: "organizationId",
      privilegeList: [
        "PRIV_MANAGE_ACCOUNTING"
      ],
      moduleList: [
        "MOD_ACCOUNTING"
      ]
    }];
  }

  async handle({ body }) {
    let { organizationId, filterByNature, filterByIsMonetary, accountIdList } = body;

    let accountList = await this.database.account.listByFilters({ organizationId, filterByNature, filterByIsMonetary, accountIdList });

    return { accountList };
  }

}