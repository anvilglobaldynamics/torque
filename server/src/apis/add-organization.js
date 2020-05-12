
const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');
const { OrganizationMixin } = require('./mixins/organization-mixin');
const { AccountingMixin } = require('./mixins/accounting-mixin');

exports.AddOrganizationApi = class extends Api.mixin(OrganizationMixin, AccountingMixin) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      name: Joi.string().min(1).max(64).required(),
      primaryBusinessAddress: Joi.string().min(1).max(128).required(),
      phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(4).max(14).required(),
      email: Joi.string().email().min(3).max(30).allow('').required(),
      activeModuleCodeList: Joi.array().items(
        Joi.string().required()
      ).optional().default(['MOD_PRODUCT', 'MOD_SERVICE', 'MOD_ACCOUNTING'])
    });
  }

  async createDefaultPaymentMethods({ organizationId }) {
    await this.database.paymentMethod.create({
      organizationId,
      name: 'Cash', 
      monetaryAccountId: (await this.getAccountByCodeName({ organizationId, codeName: 'CASH' })).id
    });

    await this.database.paymentMethod.create({
      organizationId,
      name: 'Card', 
      monetaryAccountId: (await this.getAccountByCodeName({ organizationId, codeName: 'BANK' })).id
    });

    await this.database.paymentMethod.create({
      organizationId,
      name: 'Digital', 
      monetaryAccountId: (await this.getAccountByCodeName({ organizationId, codeName: 'BANK' })).id
    });
  }

  async handle({ body, userId }) {
    let { name, primaryBusinessAddress, phone, email, activeModuleCodeList } = body;
    await this._checkIfMaxOrganizationLimitReached({ userId });

    await this._validatedactiveModuleCodeList({ activeModuleCodeList });

    let organizationId = await this._createOrganization({ name, primaryBusinessAddress, phone, email, userId, activeModuleCodeList });
    this._createOrganizationSettings({ organizationId });

    let employmentId = await this._setUserAsOwner({ userId, organizationId });
    await this._setTrialPackage({ organizationId });
    await this._addModuleActivation({ organizationId, activeModuleCodeList });

    await this.createDefaultAccounts({ organizationId, userId });
    await this.createDefaultPaymentMethods({ organizationId });

    return { status: "success", organizationId, employmentId };
  }

}