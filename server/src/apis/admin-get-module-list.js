
const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');

exports.AdminGetModuleListApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get authenticationLevel() { return 'admin'; }

  get requestSchema() {
    return Joi.object().keys({
      apiKey: Joi.string().length(64).required()
    });
  }

  async handle({ body }) {
    let moduleList = await this.database.fixture.getModuleList();
    return { moduleList };
  }

}