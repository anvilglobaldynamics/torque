const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');

exports.GetActivatedPackageListApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      apiKey: Joi.string().length(64).required(),
      organizationId: Joi.number().max(999999999999999).required()
    });
  }

  async handle({ body }) {
    let { organizationId } = body;
    let organization = await this.database.organization.findById({ organizationId });
    throwOnFalsy(organization, "ORGANIZATION_INVALID", this.verses.organizationCommon.organizationDoesNotExist);
    let packageActivationList = await this.database.packageActivation.listByOrganizationId({ organizationId });

    return { packageActivationList };
  }

}