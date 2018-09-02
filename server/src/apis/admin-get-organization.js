
const { Api } = require('../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('../utils/coded-error');

exports.AdminGetOrganizationApi = class extends Api.mixin(OrganizationCommonMixin) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get authenticationLevel() { return 'admin'; }

  get requestSchema() {
    return Joi.object().keys({
      apiKey: Joi.string().length(64).required(),
      organizationId: Joi.number().max(999999999999999).required()
    });
  }

  async handle({ body }) {
    let organization = await this.database.organization.findById({ id: body.organizationId });
    throwOnFalsy(organization, "ORGANIZATION_INVALID", "organizationBy function did not return valid organization.");
    return { organization };
  }

}