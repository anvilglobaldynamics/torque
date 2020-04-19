
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
    });
  }

  async handle({ body, username }) {
    // WARNING! This API does NOT activate MOD_ACCOUNTING. It only creates default accounting accounts

    let organizationList = await this.database.organization._find({ originApp: 'torque' });

    let affectedList = [];

    for (let organization of organizationList) {
      let organizationId = organization.id;

      // skip if organization already has accounting accounts
      let accountList = await this.database.account.listByOrganizationId({ organizationId });
      if (accountList.length > 0) continue;

      let employmentList = await this.database.employment.listByOrganizationId({ organizationId });
      if (employmentList.length === 0) continue;

      let userId = employmentList[employmentList.length - 1].userId;

      console.log({ userId, organizationId });

      affectedList.push({ userId, organizationId });

      await this.createDefaultAccounts({ organizationId, userId });

    }

    // await this._remotelyTerminateSessionOfUsersInOrganization({ organizationId });

    return { status: "success", affectedList };
  }

}