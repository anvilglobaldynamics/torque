
const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { OrganizationMixin } = require('./mixins/organization-mixin');
const { AccountingMixin } = require('./mixins/accounting-mixin');

exports.AdminSetupAccountingModuleApi = class extends Api.mixin(OrganizationMixin, AccountingMixin) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return false; }

  get authenticationLevel() { return 'admin'; }

  get isEnabled() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      apiKey: Joi.string().length(64).required(),
    });
  }

  async handle({ body, username }) {
    // WARNING! This API does NOT activate MOD_ACCOUNTING. It only creates default accounting accounts

    let organizationList = await this.database.organization._find({});

    let affectedList = [];
    let affectedList2 = [];

    // Create default accounting

    for (let organization of organizationList) {
      let organizationId = organization.id;

      // skip if organization already has accounting accounts
      let accountList = await this.database.account.listByOrganizationId({ organizationId });
      if (accountList.length > 0) {
        console.log('AA', "SKIP", organizationId);
        continue;
      }

      let employmentList = await this.database.employment.listByOrganizationId({ organizationId });
      if (employmentList.length === 0) continue;

      let userId = employmentList[employmentList.length - 1].userId;

      console.log('AA', { userId, organizationId });

      affectedList.push({ userId, organizationId });

      await this.createDefaultAccounts({ organizationId, userId });

    }

    // Create default payment methods

    for (let organization of organizationList) {
      let organizationId = organization.id;

      // skip if organization already has payment methods
      let list = await this.database.paymentMethod.listByOrganizationId({ organizationId });
      if (list.length > 0) {
        console.log('PM', "SKIP", organizationId);
        continue;
      }

      console.log('PM', { organizationId });

      affectedList2.push({ organizationId });

      await this.createDefaultPaymentMethods({ organizationId });

    }

    // change payment method in sales

    let salesList = await this.database.sales._find({});
    for (let sales of salesList) {

      let paymentList = sales.payment.paymentList;
      let wasChanged = false;
      for (let paymentEntry of paymentList) {

        if (paymentEntry.paymentMethod) {
          wasChanged = true;

          let paymentMethodName = 'Cash';
          if (paymentEntry.paymentMethod === 'card') paymentMethodName = 'Card';
          if (paymentEntry.paymentMethod === 'digital') paymentMethodName = 'Digital';

          let organizationId = (await this.database.outlet.findById({ id: sales.outletId })).organizationId;

          let pm = await this.database.paymentMethod._findOne({ organizationId, name: paymentMethodName });
          if (!pm) {
            console.log('Error', { organizationId, salesId: sales.id, paymentMethodName });
            wasChanged = false;
            break;
          }
          paymentEntry.paymentMethodId = pm.id;
          delete paymentEntry['paymentMethod'];
        }
      }

      if (wasChanged) {
        await this.database.sales._update({ id: sales.id }, {
          $set: {
            'payment.paymentList': paymentList
          }
        });
        console.log("SALES", 'DONE', sales.id);
      } else {
        console.log("SALES", 'SKIP', sales.id);
      }

    }


    // await this._remotelyTerminateSessionOfUsersInOrganization({ organizationId });

    return { status: "success", affectedList, affectedList };
  }

}