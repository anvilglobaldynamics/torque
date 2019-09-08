
const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { OrganizationMixin } = require('./mixins/organization-mixin');

exports.AdminSetModuleActivationStatusApi = class extends Api.mixin(OrganizationMixin) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get authenticationLevel() { return 'admin'; }

  get requestSchema() {
    return Joi.object().keys({
      apiKey: Joi.string().length(64).required(),
      organizationId: Joi.number().max(999999999999999).required(),
      moduleCode: Joi.string().required(),
      paymentReference: Joi.string().min(4).max(128).required(),
      action: Joi.string().valid('activate', 'deactivate').required()
    });
  }

  async _updateOrganizationactiveModuleCodeList({ organizationId, activeModuleCodeList }) {
    let result = await this.database.organization.setActiveModuleCodeList({ id: organizationId }, { activeModuleCodeList });
    this.ensureUpdate('organization', result);
  }

  async _checkIfModuleExists({ moduleCode }) {
    return await this.database.fixture.findModuleByCode({ moduleCode });
  }

  async handle({ body, username }) {
    let { organizationId, moduleCode, paymentReference, action } = body;
    let organization = await this.database.organization.findById({ id: organizationId });
    throwOnFalsy(organization, "ORGANIZATION_INVALID", this.verses.organizationCommon.organizationDoesNotExist);

    let moduleExists = await this._checkIfModuleExists({ moduleCode });
    throwOnFalsy(moduleExists, "MODULE_INVALID", this.verses.adminCommon.moduleInvalid);

    let { activeModuleCodeList } = organization;
    let organizationHasModule = (activeModuleCodeList.indexOf(moduleCode) > -1);
    if (action === 'activate') {
      throwOnTruthy(organizationHasModule, "MODULE_ACTIVATION_INVALID", "The module is already activated on the organization."); // TRANSLATE

      await this.database.moduleActivation.create({ moduleCode, organizationId, createdByAdminName: username, paymentReference });

      activeModuleCodeList.push(moduleCode);
    } else {
      throwOnFalsy(organizationHasModule, "MODULE_DEACTIVATION_INVALID", "The module is not activated on the organization."); // TRANSLATE

      let moduleActivation = await this.database.moduleActivation.findByOrganizationIdAndModuleCode({ organizationId, moduleCode });
      throwOnFalsy(organizationHasModule, "MODULE_DEACTIVATION_INVALID", "Unable to find module activation record."); // TRANSLATE

      let result = await this.database.moduleActivation.deactivate({ id: moduleActivation.id });
      this.ensureUpdate('module-activation', result);

      activeModuleCodeList.splice(activeModuleCodeList.indexOf(moduleCode), 1);
    }
    await this._updateOrganizationactiveModuleCodeList({ organizationId, activeModuleCodeList });
    await this._remotelyTerminateSessionOfUsersInOrganization({ organizationId });

    return { status: "success" };
  }

}