
const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { OrganizationMixin } = require('./mixins/organization-mixin');
const { AccountingMixin } = require('./mixins/accounting-mixin');
const { UserMixin } = require('./mixins/user-mixin');

exports.AdminRunDevopsApi = class extends Api.mixin(OrganizationMixin, AccountingMixin, UserMixin) {

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

    let affectedList = [];

    let userList = await this.database.user._find({ 'originApp': 'torque-lite' });
    // let userList = await this.database.user._find({ 'accessibleApplicationList': ['torque-lite'] });
    console.log('USERLIST', userList.length)

    // === set user.accessibleApplicationList = ['torque']
    await this.database.user._updateMany({
      'accessibleApplicationList': ['torque-lite']
    }, {
      $set: {
        'accessibleApplicationList': ['torque']
      }
    });

    // === create phone verification request
    for (let user of userList) {
      console.log("userId", user.id)
      let phoneVerificationRequest = await this.database.phoneVerificationRequest.findByForPhone({ forPhone: user.phone });
      if (!phoneVerificationRequest) {
        let verificationLink = await this._createPhoneVerificationRequest({ phone: user.phone, userId: user.id });
        this._sendPhoneVerificationSms({ phone: user.phone, verificationLink });
      }
    }

    let organizationList = await this.database.organization._find({ 'originApp': 'torque-lite' });
    console.log('ORGANIZATIONLIST', organizationList.length);

    let serviceIndustryCategoryCodeList = [
      "CAT_SALON",
      "CAT_PARLOUR",
      "CAT_GYM",
      "CAT_YOGA",
      "CAT_MUSIC_DANCE",
      "CAT_BEAUTY"
    ]

    // === organization package and module
    for (let organization of organizationList) {
      let organizationId = organization.id;
      console.log('organizationId', organizationId);

      if (organization.activeModuleCodeList.length === 3) {
        console.log("SKIP")
      }

      // get outlet
      let outlet = await this.database.outlet._findOne({ organizationId });
      if (!outlet) {
        console.log("Missing outlet")
        continue;
      }

      // deactivate all modules
      await this.database.moduleActivation._updateMany({ organizationId }, {
        $set: {
          isDeactivated: true,
          deactivatedDatetimeStamp: Date.now()
        }
      });

      let activeModuleCodeList = ['MOD_ACCOUNTING', 'MOD_VENDOR'];

      if (serviceIndustryCategoryCodeList.indexOf(outlet.categoryCode) === -1) {
        activeModuleCodeList.push('MOD_PRODUCT');

        await this.database.moduleActivation.create({
          moduleCode: 'MOD_PRODUCT',
          organizationId,
          createdByAdminName: 'default',
          paymentReference: 'Free Upgradation'
        });
      } else {
        activeModuleCodeList.push('MOD_SERVICE');

        await this.database.moduleActivation.create({
          moduleCode: 'MOD_SERVICE',
          organizationId,
          createdByAdminName: 'default',
          paymentReference: 'Free Upgradation'
        });
      }

      await this.database.moduleActivation.create({
        moduleCode: 'MOD_VENDOR',
        organizationId,
        createdByAdminName: 'default',
        paymentReference: 'Free Upgradation'
      });

      await this.database.moduleActivation.create({
        moduleCode: 'MOD_ACCOUNTING',
        organizationId,
        createdByAdminName: 'default',
        paymentReference: 'Free Upgradation'
      });

      await this.database.organization._update({ id: organizationId }, {
        $set: {
          activeModuleCodeList
        }
      });

      let packageActivationId = await this.database.packageActivation.create({
        packageCode: 'RS-F01',
        organizationId,
        createdByAdminName: 'default',
        paymentReference: 'Free Upgradation'
      });
      let result = await this.database.organization.setPackageActivationId({ id: organizationId }, { packageActivationId });

    }

    console.log("ALL DONE")

    return { status: "success", affectedList };
  }

  async __oldCodeKeptForReference() {

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

  }

}