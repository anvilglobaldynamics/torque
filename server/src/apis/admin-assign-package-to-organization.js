
const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');

const { OrganizationCommonMixin } = require('./mixins/organization-common');

exports.AdminAssignPackageToOrganizationApi = class extends Api.mixin(OrganizationCommonMixin) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get authenticationLevel() { return 'admin'; }

  get requestSchema() {
    return Joi.object().keys({
      apiKey: Joi.string().length(64).required(),
      organizationId: Joi.number().max(999999999999999).required(),
      packageCode: Joi.string().required()
    });
  }

  async handle({ body }) {
    // let organization = await this._findOrganizationByEmailOrPhone({ emailOrPhone: body.emailOrPhone });
    // throwOnFalsy(organization, "ORGANIZATION_DOES_NOT_EXIST", this.verses.userLoginApi.userNotFound);
    return {};
  }

}