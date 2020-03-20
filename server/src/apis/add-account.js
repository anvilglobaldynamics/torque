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

      name: Joi.string().min(1).max(32).required()
    });
  }

  get accessControl() {
    return [{
      organizationBy: "organizationId",
      privilegeList: [
        // TODO: update privilegeList with relevant privilege
        // "PRIV_MODIFY_ALL_PRODUCT_BLUEPRINTS"
      ],
      moduleList: [
        // TODO: update privilegeList with relevant privilege
        // "MOD_ACCOUNTING",
      ]
    }];
  }

  async handle({ body }) {
    console.log("IN AddAccountApi");
    let { organizationId, name } = body;
    let account = 0;
    return { status: "success", accountId };
  }

}