
const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');

exports.AdminListOrganizationPackagesApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get authenticationLevel() { return 'admin'; }

  get requestSchema() {
    return Joi.object().keys({
      apiKey: Joi.string().length(64).required(),
      organizationId: Joi.number().max(999999999999999).required()
    });
  }

  async _insertPackageDetailsInPackageActivationList({ packageActivationList }) {
    let packageList = await this.database.fixture.getPackageList();
    packageActivationList.forEach(element => {
      packageList.forEach(aPackage => {
        if (aPackage.code == element.packageCode) {
          element.packageDetail = aPackage;
        }
      });
    });
    return packageActivationList;
  }

  async handle({ body }) {
    let { organizationId } = body;
    let organization = await this.database.organization.findById({ id: organizationId });
    throwOnFalsy(organization, "ORGANIZATION_DOES_NOT_EXIST", this.verses.organizationCommon.organizationDoesNotExist);

    let packageActivationList = await this.database.packageActivation.listByOrganizationId({ organizationId });
    packageActivationList = await this._insertPackageDetailsInPackageActivationList({ packageActivationList });

    return { packageActivationList };
  }

}