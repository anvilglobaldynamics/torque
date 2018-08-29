
const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { OrganizationCommonMixin } = require('./mixins/organization-common');

exports.AdminFindOrganizationApi = class extends Api.mixin(OrganizationCommonMixin) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get authenticationLevel() { return 'admin'; }

  get requestSchema() {
    return Joi.object().keys({
      apiKey: Joi.string().length(64).required(),
      emailOrPhone: Joi.alternatives([
        Joi.string().email().min(3).max(30), // if email
        Joi.string().regex(/^[a-z0-9\+]*$/i).min(11).max(15) // if phone
      ]).required()
    });
  }

  async handle({ body }) {
    let organization = await this._findOrganizationByEmailOrPhone({ emailOrPhone: body.emailOrPhone });
    throwOnFalsy(organization, "ORGANIZATION_DOES_NOT_EXIST", this.verses.organizationCommon.organizationDoesNotExist);
    return { organization };
  }

}