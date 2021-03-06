
const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');

exports.AdminAssignPackageToOrganizationApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get authenticationLevel() { return 'admin'; }

  get requestSchema() {
    return Joi.object().keys({
      apiKey: Joi.string().length(64).required(),
      organizationId: Joi.number().max(999999999999999).required(),
      packageCode: Joi.string().required(),
      paymentReference: Joi.string().min(4).max(128).required()
    });
  }

  async _updateOrganizationPackageActivationId({ organizationId, packageActivationId }) {
    let result = await this.database.organization.setPackageActivationId({ id: organizationId }, { packageActivationId });
    this.ensureUpdate('organization', result);
  }

  async _checkIfPackageExists({ packageCode }) {
    return await this.database.fixture.findPackageByCode({ packageCode });
  }

  async handle({ body, username }) {
    let { organizationId, packageCode, paymentReference } = body;
    let organization = await this.database.organization.findById({ id: organizationId });
    throwOnFalsy(organization, "ORGANIZATION_DOES_NOT_EXIST", this.verses.organizationCommon.organizationDoesNotExist);

    let packageExists = await this._checkIfPackageExists({ packageCode });
    throwOnFalsy(packageExists, "PACKAGE_INVALID", this.verses.adminCommon.packageInvalid);

    let packageActivationId = await this.database.packageActivation.create({ packageCode, organizationId, createdByAdminName: username, paymentReference });
    await this._updateOrganizationPackageActivationId({ organizationId, packageActivationId });

    return { status: "success", packageActivationId };
  }

}