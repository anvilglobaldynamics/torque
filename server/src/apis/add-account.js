const { Api } = require('../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('../utils/coded-error');
const { extract } = require('../utils/extract');

exports.AddAccountApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      organizationId: Joi.number().max(999999999999999).required(),

      displayName: Joi.string().min(1).max(32).required(),
      nature: Joi.string().valid('asset', 'liability', 'equity', 'revenue', 'expense').required(),
      isMonetaryAccount: Joi.boolean().required(),
      note: Joi.string().allow('').max(64).required(),
    });
  }

  get accessControl() {
    return [{
      organizationBy: "organizationId",
      privilegeList: [
        "PRIV_MANAGE_ACCOUNTING"
      ],
      moduleList: [
        // TODO: update moduleList with MOD_ACCOUNTING
        // "MOD_ACCOUNTING",
      ]
    }];
  }

  async handle({ body }) {
    let { organizationId, displayName, nature, isMonetaryAccount, note } = body;

    // Create a custom codeName, like CUSTOM_41
    let codeNumber = await this.database.account.autoGenerateOrganizationSpecificNumber({ organizationId, fieldName: 'customAccountingAccountNumberSeed' });
    let codeName = 'CUSTOM_' + codeNumber;

    // Add to database
    let accountId = await this.database.account.create({
      displayName, nature, isMonetaryAccount, note, organizationId,
      codeName,
      isDefaultAccount: false,
    })

    return { status: "success", accountId };
  }

}