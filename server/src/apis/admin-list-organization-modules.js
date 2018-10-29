
const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');

exports.AdminListOrganizationModulesApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get authenticationLevel() { return 'admin'; }

  get requestSchema() {
    return Joi.object().keys({
      apiKey: Joi.string().length(64).required(),
      organizationId: Joi.number().max(999999999999999).required(),
    });
  }

  async _insertModuleDetailsInModuleActivationList({ moduleActivationList }) {
    let moduleList = await this.database.fixture.getModuleList();
    moduleActivationList.forEach(moduleActivation => {
      moduleList.forEach(aModule => {
        if (aModule.code == moduleActivation.packageCode) {
          moduleActivation.packageDetail = aModule;
        }
      });
    });
    return moduleActivationList;
  }

  async handle({ body }) {
    let { organizationId } = body;
    let organization = await this.database.organization.findById({ id: organizationId });
    throwOnFalsy(organization, "ORGANIZATION_INVALID", this.verses.organizationCommon.organizationDoesNotExist);

    let moduleActivationList = await this.database.moduleActivation.listByOrganizationId({ organizationId });
    moduleActivationList = await this._insertModuleDetailsInModuleActivationList({ moduleActivationList });

    return { moduleActivationList };
  }

}