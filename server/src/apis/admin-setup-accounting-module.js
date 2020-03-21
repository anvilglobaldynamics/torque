
const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { OrganizationMixin } = require('./mixins/organization-mixin');
const { AccountingMixin } = require('./mixins/accounting-mixin');

exports.AdminSetupAccountingModuleApi = class extends Api.mixin(OrganizationMixin, AccountingMixin) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get authenticationLevel() { return 'admin'; }

  get isEnabled() { return false; }

  get requestSchema() {
    return Joi.object().keys({
      apiKey: Joi.string().length(64).required(),
      organizationId: Joi.number().max(999999999999999).required()
    });
  }

  async handle({ body, username }) {
    let { organizationId } = body;
    let organization = await this.database.organization.findById({ id: organizationId });
    throwOnFalsy(organization, "ORGANIZATION_INVALID", this.verses.organizationCommon.organizationDoesNotExist);

    // Activate MOD_ACCOUNTING if not activated. May not be appropriate after development. Consider removing - start
    let { activeModuleCodeList } = organization;
    let organizationHasModule = (activeModuleCodeList.indexOf(moduleCode) > -1);
    if (!organizationHasModule) {
      await this.database.moduleActivation.create({ moduleCode: "MOD_ACCOUNTING", organizationId, createdByAdminName: username, paymentReference: "Internal" });
      activeModuleCodeList.push(moduleCode);
    }
    let result = await this.database.organization.setActiveModuleCodeList({ id: organizationId }, { activeModuleCodeList });
    this.ensureUpdate('organization', result);
    // - end

    // TODO: org owner id should be passed as userId
    await this.createDefaultAccounts({ organizationId });

    await this._remotelyTerminateSessionOfUsersInOrganization({ organizationId });

    return { status: "success" };
  }

}