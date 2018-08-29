
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

  async _updateOrganizationPackageActivationId({ organizationId, packageActivationId }) {
    let result = await this.database.organization.setPackageActivationId({ id: organizationId }, { packageActivationId });
    this.ensureUpdate('organization', result);
  }

  async handle({ body }) {
    let { organizationId, packageCode } = body;
    let organization = await this.database.organization.findById({ organizationId });
    throwOnFalsy(organization, "ORGANIZATION_DOES_NOT_EXIST", this.verses.organizationCommon.organizationDoesNotExist);
    let packageActivationId = await this.database.packageActivation.create({ packageCode, organizationId });
    await this._updateOrganizationPackageActivationId({ organizationId, packageActivationId });
    return { packageActivationId };
  }

}